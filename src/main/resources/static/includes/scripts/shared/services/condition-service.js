
class ConditionNode {
    children = new Map();
    conditions = new Map();

    set(path, item) {
        this.#setItem(this.#parsePath(path), item);
    }

    #setItem(pathList, item) {
        if (pathList.length == 0)
            return;

        const fieldName = pathList.shift();

        // If the end of the list is reached put the item in the map
        if (pathList.length == 0) {
            this.conditions.set(fieldName, item);
            return;
        }
        
        if (!this.children.has(fieldName)) {
            this.children.set(fieldName, new ConditionNode());
        }
        this.children.get(fieldName).#setItem(pathList, item);
    }

    get(path) {
        return this.#getItem(this.#parsePath(path));
    }

    #getItem(pathList) {
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
    move(oldPath, newPath) {
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
    #updateNames(item, oldPath, newPath) {
        if (item instanceof ConditionNode) {
            for (const child of item.children.values()) {
                child.#updateNames(child, oldPath, newPath);
            }

            for (const condition of item.conditions.values()) {
                this.#updateCondition(condition, oldPath, newPath);
            }
        } else {
            this.#updateCondition(item, oldPath, newPath)
        }
    }

    #updateCondition(oldItem, oldPath, newPath) {
        if (oldItem.var1.startsWith(oldPath)) {
            oldItem.var1 = oldItem.var1.replace(oldPath, newPath);
        }
        if (oldItem.var2.startsWith(oldPath)) {
            oldItem.var2 = oldItem.var2.replace(oldPath, newPath);
        }
    }

    #deleteItem(pathList) {
        const fieldName = pathList.shift();
        if (pathList.length == 0) {
            
            // If the conditions has the fieldName return the field
            if (this.conditions.has(fieldName)) {
                const condition = this.conditions.get(fieldName);
                this.conditions.delete(fieldName);
                return condition;
            } else
            // If the ConditionNode has children with fieldName
            if (this.children.has(fieldName)) {
                const child = this.children.get(fieldName);
                this.children.delete(fieldName);
                return child;
            }
        } else if (this.children.has(fieldName)) {
            const subNode = this.children.get(fieldName);
            const result = subNode.#deleteItem(pathList);
          
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
    #setConditionNodeItem(pathList, conditionNode) {
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

    #parsePath(path) {
        if (typeof path !== 'string') return [];
        const pathList = path.split('.');
        if (pathList[0] === '$') {
            pathList.shift(); 
        }
        return pathList;
    }

}

/**
 * After a name has been updated:
 * - Check the conditions (and templates)
 * - Update fieldnames
 */
export class ContitionService {
    static #node = new ConditionNode();

    static addCondition(path, field) {
        this.#node.set(path, field);
    }
    
    static notify(oldPath, newPath) {
        this.#node.move(oldPath, newPath);
        console.log('end notify', this.#node);
    }
}