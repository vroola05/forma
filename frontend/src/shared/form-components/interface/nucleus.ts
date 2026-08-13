import { FormService } from '../../../form-viewer/services/form-service'
import { ConditionParser } from '../../condition-components/condition-parser';
import { Condition } from '../../model/types';
import { ValidationBase } from './validation-base';

export class Nucleus extends ValidationBase {
    metadata = new Map<string, any>();

    id: string | undefined = undefined;
    name: string = '';
    label: string | undefined = '';
    type: string = '';

    classes: string = '';
    show: boolean = true;
    showCondition: ConditionParser | undefined;

    content: HTMLDivElement = document.createElement('div');

    constructor(name: string, label: string | undefined, id: string | undefined = undefined) {
        super();
        if (!name) {
            throw new Error('Name is a required parameter');
        }
        
        this.name = name;
        this.label = label;
        this.id = id;

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

    getId() {
        return this.id ? `${this.name}-${this.id}` : this.name;
    }

    setId(id: string | undefined) {
        this.id = id;
        return this;
    }
    
    getName() {
        return this.name;
    }

    setLabel(label: string | undefined) {
        this.label = label;
        return this;
    }

    getLabel() {
        return this.label;
    }

    setType(type: string) {
        this.type = type;
        return this;
    }

    getType() {
        return this.type;
    }

    setClasses(classes: string | undefined) {
        if (classes)
            this.classes = classes;
        return this;
    }

    getContent() {
        return this.content;
    }

    setShowConditions(condition: Condition | undefined) {
        if (!condition || Object.keys(condition).length === 0) {
            return this;
        }

        const isEmpty = Object.values(condition).every(waarde => !waarde);
        if (isEmpty) {
            return this;
        }


        this.showCondition = new ConditionParser(condition, (hasCondition: boolean) => {
            this.setShow(hasCondition);
        });
        
        return this;
    }

    getShow() {
        return this.show;
    }

    setShow(show: boolean) {
        this.show = show;
        if (show) {
            this.content.classList.remove('hidden');
        } else {
            this.content.classList.add('hidden');
        }
    }

    hasChildren(): boolean {
        return false;
    }
}
