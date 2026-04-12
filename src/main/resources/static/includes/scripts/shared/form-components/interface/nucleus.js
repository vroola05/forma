import { FormService } from '../../../form-viewer/services/form-service.js'
import { Condition } from '../../condition-components/types/condition-types.js';
import { ConditionParser } from '../../condition-components/condition-parser.js';

export class Nucleus {
    metadata = new Map();

    name = '';
    label = '';
    type = '';

    classes = '';
    show = true;
    showCondition = undefined;

    content = document.createElement('div');

    constructor(name, label) {
        if (!name) {
            throw new Error('Name is a required parameter');
        }
        
        this.name = name;
        this.label = label;

        FormService.getInstance().addNucleus(this);
    }

    /**
     * This function is called after the field is added to its parent.
     */
    afterInit() {
        
    }

    /**
     * This function is called after the form is initialized.
     */
    afterFormInit() {
        if (this.showCondition !== undefined) {
            this.showCondition.eval();
        }
    }
    
    getName() {
        return this.name;
    }

    setLabel(label) {
        this.label = label;
        return this;
    }

    getLabel() {
        return this.label;
    }

    setType(type) {
        this.type = type;
        return this;
    }

    getType() {
        return this.type;
    }

    setClasses(classes) {
        if (classes)
            this.classes = classes;
        return this;
    }

    setMetadata(metadata) {
        if (metadata) {
            for (const m of metadata) {
                this.metadata.set(m, m);
            }
        }
        return this;
    }

    hasMetadata(metadata) {
        return this.metadata.size == 0 || this.metadata.has(metadata);
    }

    getContent() {
        return this.content;
    }

    getFields() {
        return null;
    }

    setShowConditions(showCondition) {
        if (!showCondition || Object.keys(showCondition).length === 0) {
            return this;
        }

        const isEmpty = Object.values(showCondition).every(waarde => !waarde);
        if (isEmpty) {
            return this;
        }

        const condition = new Condition();
        condition.var1 = showCondition.var1;
        condition.operator = showCondition.operator;
        condition.var2 = showCondition.var2;
        condition.conditions = showCondition.conditions;
        condition.logicalOperator = showCondition.logicalOperator;

        this.showCondition = new ConditionParser(condition, (hasCondition) => {
            this.setShow(hasCondition);
        });
        
        return this;
    }

    enablePersistence(enabled) {
        return this;
    }

    getShow() {
        return this.show;
    }

    setShow(show) {
        this.show = show;
        if (show) {
            this.content.classList.remove('hidden');
        } else {
            this.content.classList.add('hidden');
        }
    }
}
