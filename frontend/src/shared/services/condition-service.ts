
class ConditionNode {
    children = new Map();
    conditions = new Map();

    set(path: string, item: any) {
        this.#setItem(this.#parsePath(path), item);
    }

    #setItem(pathList: string[], item: any) {
        if (pathList.length == 0)
            return;

        const fieldName = pathList.shift();

        // If the end of the list is reached put the item in the map
        if (pathList.length == 0) {
            if (!this.conditions.has(fieldName)) {
                this.conditions.set(fieldName, []);
            }
            this.conditions.get(fieldName).push(item);
            return;
        }
        
        if (!this.children.has(fieldName)) {
            this.children.set(fieldName, new ConditionNode());
        }
        this.children.get(fieldName).#setItem(pathList, item);
    }

    get(path: string) {
        return this.#getItem(this.#parsePath(path));
    }

    #getItem(pathList: string[]) {
        const fieldName = pathList.shift();
        if (pathList.length == 0) {
            return this.conditions.get(fieldName);
        }

        if (this.children.has(fieldName)) {
            return this.children.get(fieldName).#getItem(pathList);
        }
        
    }

    /**
     * Moves the items in the old path to the new location 
     * and updates all conditions
     * @param {*} oldPath 
     * @param {*} newPath 
     * @returns 
     */
    move(oldPath: string, newPath: string) {
        if (oldPath === newPath)
            return;

        const oldItem = this.#deleteItem(this.#parsePath(oldPath));
        if (!oldItem) return;
        
        this.#updateNames(oldItem, oldPath, newPath);
        
        if (oldItem instanceof ConditionNode) {
            this.#setConditionNodeItem(this.#parsePath(newPath), oldItem);
        } else {
            this.#setItem(this.#parsePath(newPath), oldItem);
        }
    }

    /**
     * Changes all variables in the condition objects to the new path
     * @param {*} item 
     * @param {*} oldPath 
     * @param {*} newPath 
     */
    #updateNames(item: any, oldPath: string, newPath: string) {
        if (item instanceof ConditionNode) {
            for (const child of item.children.values()) {
                child.#updateNames(child, oldPath, newPath);
            }

            for (const condition of item.conditions.values()) {
                this.#updateConditions(condition, oldPath, newPath);
            }
        } else {
            this.#updateConditions(item, oldPath, newPath)
        }
    }

    #updateConditions(oldItems: any[], oldPath: string, newPath: string) {
        for (const oldItem of oldItems) {
            if (oldItem.var1.startsWith(oldPath)) {
                oldItem.var1 = oldItem.var1.replace(oldPath, newPath);
            }
            if (oldItem.var2.startsWith(oldPath)) {
                oldItem.var2 = oldItem.var2.replace(oldPath, newPath);
            }
        }
    }

    delete(path: string, item: any = undefined) {
        this.#deleteItem(this.#parsePath(path), item);
    }

    /**
     * 
     * @param {*} pathList 
     * @param {*} item - The specific condition that needs to be removed
     * @returns 
     */
    #deleteItem(pathList: string[], item: any = undefined) {
        const fieldName = pathList.shift();
        if (pathList.length == 0) {
            
            // If the conditions has the fieldName return the field
            if (this.conditions.has(fieldName)) {
                const conditions = this.conditions.get(fieldName);
                if (item && conditions) {
                    conditions.splice(0, conditions.length, ...conditions.filter((c: any) => c !== item));
                    
                    if (conditions.length == 0) {
                        this.conditions.delete(fieldName)
                    }
                } else {
                    this.conditions.delete(fieldName);
                    return conditions;
                }
                
            } else
            // If the ConditionNode has children with fieldName
            if (this.children.has(fieldName)) {
                const child = this.children.get(fieldName);
                this.children.delete(fieldName);
                return child;
            }
        } else if (this.children.has(fieldName)) {
            const subNode = this.children.get(fieldName);
            const result = subNode.#deleteItem(pathList, item);
          
            if (subNode.conditions.size === 0 && subNode.children.size === 0) {
                this.children.delete(fieldName);
            }
            return result;
        }

        return undefined;
    }


    /**
     * Puts the conditionNode on the location of pathList
     * @param {*} pathList 
     * @param {*} conditionNode 
     * @returns 
     */
    #setConditionNodeItem(pathList: string[], conditionNode: ConditionNode) {
        if (pathList.length == 0)
            return;

        const fieldName = pathList.shift();

        if (pathList.length == 0) {
            if (!this.children.has(fieldName)) {
                this.children.set(fieldName, conditionNode);
            } else {
                const targetNode = this.children.get(fieldName);

                for (const [k, v] of conditionNode.children.entries()) {
                    targetNode.children.set(k, v);
                }

                for (const [k, v] of conditionNode.conditions.entries()) {
                    targetNode.conditions.set(k, v);
                }
                
            }
            return;
        }

        if (!this.children.has(fieldName)) {
            this.children.set(fieldName, new ConditionNode());
        } 

        this.children.get(fieldName).#setConditionNodeItem(pathList, conditionNode);
    }

    #parsePath(path: string) {
        if (typeof path !== 'string') return [];
        const pathList = path.split('.');
        if (pathList[0] === '$') {
            pathList.shift(); 
        }
        return pathList;
    }

}

/**
 * This service creates a tree of ConditionNodes.
 * When the name of a field has been updated, this service updates
 * the paths of all the condition that contain the updated name.
 * 
 * @TODO When a field is deleted, all the conditions also need to bee deleted
 * 
 * After a name has been updated:
 * - Check the conditions (and templates)
 * - Update fieldnames
 */
export class ContitionService {
    static #node = new ConditionNode();

    static addCondition(path: string, field: any) {
        this.#node.set(path, field);
    }

    static deleteCondition(path: string, field: any = undefined) {
        this.#node.delete(path, field);
    }
    
    static notify(oldPath: string, newPath: string) {
        this.#node.move(oldPath, newPath);
    }
}