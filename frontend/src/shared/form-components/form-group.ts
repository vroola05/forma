import { FormRenderer } from '../generic-components/form-renderer';

import { BaseFieldDto, FieldDto } from '../model/types';
import { InputNucleus } from './interface/input-base';
import { Nucleus } from './interface/nucleus';

export class FormGroup extends Nucleus {
    content = document.createElement('div');
    
    formDomElements = document.createElement('form');
    formGroupTitleDom = document.createElement('div');

    fields: InputNucleus[] = [];

    constructor(baseFieldDto: BaseFieldDto, id: string | undefined = undefined) {
        super(baseFieldDto.name, baseFieldDto.labels, id);

        this.type = baseFieldDto.type;
        this.label = baseFieldDto.label;

        this.setShowConditions(baseFieldDto?.condition);

        this.createElement(baseFieldDto.classes);
    }
    
    async init(baseFieldDto: BaseFieldDto): Promise<this> {
        if (baseFieldDto.fields) {
            await this.createFields(baseFieldDto.fields)
                .then((field) => {})
                .catch(error => console.error("Something went wrong:", error));
        }

        return this;
    }

    /**
     * 
     * @param {*} label - De titel van het document
     * @param {*} classes - Additionele css classes
     */
    createElement( classes: string = '') {
        this.content.id = this.getId() + '-form-group';
        this.content.className = `form-group ${classes}`;

        const label = this.getLabel();
        if (label !== '') {
            this.formGroupTitleDom.className = 'form-group-title pt-4 pb-2';
            this.formGroupTitleDom.innerHTML = `<h2>${label}</h2>`;
            this.content.append(this.formGroupTitleDom);
        }

        this.formDomElements.id = this.getId();
        this.formDomElements.className = 'form-group-container needs-validation';
        this.formDomElements.setAttribute('novalidate', 'true');
        this.content.append(this.formDomElements);
    }
    
    async createFields(fields: FieldDto[])  {
        for (const fieldDto of fields) {
            const field = await FormRenderer.createField(fieldDto);
            if (!field || (!(field instanceof InputNucleus))) {
                throw new Error('Input must be an instance of Input class');
            }

            this.fields.push(field);

            this.formDomElements.append(field.getContent())
            
            field.afterInit();
        }
    }

    /**
     * Valideert het formulier door alle geregistreerde inputs te controleren.
     * Het voegt de 'was-validated' klasse toe aan het formulier om de validatie visueel weer te geven.
     * @param {*} name
     * @return {boolean} true als alle inputs geldig zijn, anders false
     */
    validate() {
        if (!this.getShow()) {
            return true;
        }

        let valid = true
        this.formDomElements.classList.remove('was-validated');

        this.fields.forEach(input => {
            if (!input.validate()) {
                valid = false;
            }
        });

        this.formDomElements.classList.add('was-validated');

        return valid;
    }

    /**
     * Expects th
     * @param {*} fieldErrors 
     */
    setBackendErrors(fieldErrors: Map<string, string[]>) {
        this.fields.forEach(field => {
            if (fieldErrors.has(field.getName())) {
                field.setBackendErrorsField(false, fieldErrors.get(field.getName()));
            } else {
                field.setBackendErrorsField(true);
            }
        });
    }

    getValue() {
        return null;
    }

    hasChildren(): boolean {
        return true;
    }

    getFields() {
        return this.fields;
    }

    getField(name: string) {
        return this.fields.find(f => f.name === name);
    }

    getFieldValue(name: string) {
        const field = this.fields.find(f => f.name === name);
        return !field ? undefined : field.hasOptions() ? field.getOptions() : field.getValue();
    }
}