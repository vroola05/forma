import { CheckboxField } from '../../shared/form-components/checkbox-field.js';
import { FormRenderer } from './form-renderer.js';

export class FormSummaryRenderer {
    constructor(form) {
        this.form = form;
        this.createElement();
    }

    createElement() {
        this.content = document.createElement('div');
        this.content.className = 'form-summary-renderer';

    }

    getContent() {
        return this.content;
    }

    onActiveChange(active) {
        this.content.innerHTML = '';
        
        const tabWrapper = document.createElement('div');
        tabWrapper.className = 'summary-tab-wrapper';
        this.content.appendChild(tabWrapper);

        for (const tabPage of this.form.getFields()) {
            if (tabPage.getName() === 'summary') {
                continue;
            }
            if (!tabPage.getShow()) {
                continue;
            }
            const tabWrapperInner = document.createElement('div');
            tabWrapperInner.className = 'summary-tab-wrapper-inner';
            tabWrapper.appendChild(tabWrapperInner);
            tabWrapperInner.appendChild(document.createElement('h2')).innerText = tabPage.getLabel();

            for (const formGroup of tabPage.getFields()) {
                this.#routeField(formGroup, tabWrapperInner);
            }
        }

        
        // for (const i in this.form.confirmation) {
        //     const confirmationWrapper = document.createElement('div');
        //     confirmationWrapper.className = 'summary-confirmation-wrapper';

        //     const checkbox = new CheckboxField(`confirmation-${i}`, this.form.confirmation[i], '');
        //     checkbox.addOption('confirm', '', false);
        //     confirmationWrapper.appendChild(checkbox.getContent());
        //     this.content.appendChild(confirmationWrapper);  
        // }

        this.#createConfirmation();
    }

    #createConfirmation() {
        console.log('this.form.confirmationCheck', this.form.confirmationCheck);
        
        
    }

    #routeField(field, container) {
        if (!field.getShow()) {
            return;
        }
        if (field.getType() === 'form-group') {
            this.#renderFormGroup(field, container);
        } else {
            this.#renderField(field, container);
        }
    }

    #renderFormGroup(formGroup, container) {
        const formGroupWrapper = document.createElement('div');
        formGroupWrapper.className = 'summary-form-group-wrapper';
        container.appendChild(formGroupWrapper);

        if (formGroup.getLabel()) {
            formGroupWrapper.appendChild(document.createElement('h3')).innerText = formGroup.getLabel();
        }

        const groupWrapper = document.createElement('div');
        groupWrapper.className = 'summary-form-group';
        formGroupWrapper.appendChild(groupWrapper);

        for (const field of formGroup.getFields()) {
            this.#renderField(field, groupWrapper);
        }
    }

    #renderField(field, container) {
        if (!field.getShow()) {
            return;
        }
        const fieldWrapper = document.createElement('div');
        fieldWrapper.className = 'summary-field-wrapper';
        container.appendChild(fieldWrapper);
        const fieldLabel = document.createElement('div');
        fieldLabel.className = 'summary-field-label';
        fieldLabel.innerHTML = `${field.getLabel()}:`;
        fieldWrapper.appendChild(fieldLabel);

        const fieldValue = document.createElement('div');
        fieldValue.className = 'summary-field-value';
        fieldValue.innerText = field.getValue() || '';
        fieldWrapper.appendChild(fieldValue);
    }
}