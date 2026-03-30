import { FormRenderer } from '../../form-viewer/components/form-renderer.js';
import { Page } from '../page-components/page.js';
import { InputNucleus } from './interface/input-base.js';
import { RepeatingGroup } from './repeating-group.js';
import { Storage } from '../services/storage-service.js';
import { Nucleus } from './interface/nucleus.js';

export class FormGroup extends Nucleus {
    content = document.createElement('div');
    formGroupTitleDom = document.createElement('div');

    
    formInputKeyValue = {};
    fields = [];

    constructor(formGroupData) {
        super(formGroupData.name, formGroupData.label);

        this.type = formGroupData.type;
        this.id = formGroupData.id;
        this.setMetadata(formGroupData.metadata);
        this.setShowConditions(formGroupData.condition);

        this.createElement(formGroupData.name, formGroupData.label, formGroupData.classes);

        const formInputKeyValue = Storage.getPageItem(this.name);

        if (formInputKeyValue) {
            this.formInputKeyValue = JSON.parse(formInputKeyValue);
        }

        formGroupData.fields.forEach(fieldData => {
            this.createInput(fieldData);
        });
    }


    /**
     * 
     * @param {*} name - Een unieke naam voor het formulier
     * @param {*} label - De titel van het document
     * @param {*} classes - Additionele css classes
     */
    createElement(name, label = '', classes = '') {
        this.content = document.createElement('div');
        this.content.id = name + '-form-group';
        this.content.className = `form-group ${classes}`;

        if (label != '') {
            this.formGroupTitleDom.className = 'form-group-title pt-4 pb-2';
            this.formGroupTitleDom.innerHTML = `<h2>${label}</h2>`;
            this.content.append(this.formGroupTitleDom);
        }

        this.formDomElements = document.createElement('form');
        this.formDomElements.id = name;
        this.formDomElements.className = 'form-group-container needs-validation';
        this.formDomElements.setAttribute('novalidate', 'true');
        this.content.append(this.formDomElements);

    }
    
    createInput(fieldData) {
        let field = FormRenderer.createField(fieldData);
        if (!field || (!(field instanceof InputNucleus) && !(field instanceof RepeatingGroup))) {
            throw new Error('Input must be an instance of Input class');
        }

        // Dit is een callback op de wijziging van de input waarde.
        // Deze callback slaat de waarde op in de formInputKeyValue object en in de session storage.
        field.addValueChangedListener((name, value) => {
            this.formInputKeyValue[name] = value;
            Storage.setPageItem(this.name, JSON.stringify(this.formInputKeyValue));
        });

        field.setId(`${this.name}-${field.getName()}`);
        this.fields.push(field);

        this.formDomElements.append(field.getContent())

        // Kijk of er al een waarde in de session storage staat voor dit formulier en deze field.
        if (field.name in this.formInputKeyValue && field.type != 'repeating-group') {
            field.setValue(this.formInputKeyValue[field.name], false);
        }
        
        field.afterInit();
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

    getValue() {
        return this.formInputKeyValue;
    }

    getFields() {
        return this.fields;
    }
}