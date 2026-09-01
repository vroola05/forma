import { FormService } from '../../../form-viewer/services/form-service';
import { ConditionParser } from '../../condition-components/condition-parser';
import { Condition, TranslationDto } from '../../model/types';
import { Lang } from '../../services/lang';
import { ValidationBase } from './validation-base';

export class Nucleus extends ValidationBase {
    metadata = new Map<string, any>();

    prefix: string | undefined = undefined;
    id: string | undefined = undefined;
    name: string = '';
    // Label is onlu used when manualy creating a form
    label: string | undefined = '';
    labels: TranslationDto[] | undefined = [];
    type: string = '';

    classes: string = '';
    show: boolean = true;
    showCondition: ConditionParser | undefined;

    content: HTMLDivElement = document.createElement('div');

    constructor(
            name: string, labels: TranslationDto[] | undefined,
            id: string | undefined = undefined,
            prefix: string | undefined = undefined) {
        super();
        if (!name) {
            throw new Error('Name is a required parameter');
        }
        
        this.name = name;
        this.labels = labels;
        this.prefix = prefix;
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
        const baseId = this.id ? `${this.name}-${this.id}` : this.name;
        return this.prefix ? `${this.prefix}-${baseId}` : baseId;
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

    setLabels(label: TranslationDto[] | undefined) {
        this.labels = label;
        return this;
    }

    getLabels() {
        return this.labels;
    }

    getLabel(): string {
        
        const locale = Lang.getLocale();

        const localeDefault = Lang.getDefaultLocale();

        if (this.labels && this.labels.length > 0) {
            let label = this.labels.find(l => l.locale === locale);
            if (label?.text) {
                return label.text;
            }
            label = this.labels.find(l => l.locale === localeDefault);
            if (label?.text) {
                return label.text;
            }
        }
        return this.label ? this.label : ''

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

    validate(): boolean {
        return true;
    }
    /**
     * Returns true if the values are stored in an array
     * @returns boolean
     */
    hasChildren(): boolean {
        return false;
    }

    /**
     * Returns true if the values are stored in a set or double array
     * @returns boolean
     */
    hasSets(): boolean {
        return false;
    }
}
