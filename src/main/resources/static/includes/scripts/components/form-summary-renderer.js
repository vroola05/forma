import { CheckboxField } from '../form/input-fields.js';

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

            const tabWrapperInner = document.createElement('div');
            tabWrapperInner.className = 'summary-tab-wrapper-inner';
            tabWrapper.appendChild(tabWrapperInner);
            tabWrapperInner.appendChild(document.createElement('h2')).innerText = tabPage.getLabel();

            for (const formGroup of tabPage.getFields()) {
                const formGroupWrapper = document.createElement('div');
                formGroupWrapper.className = 'summary-form-group-wrapper';
                tabWrapperInner.appendChild(formGroupWrapper);

                if (formGroup.getLabel()) {
                    formGroupWrapper.appendChild(document.createElement('h3')).innerText = formGroup.getLabel();
                }

                const groupWrapper = document.createElement('div');
                groupWrapper.className = 'summary-form-group';
                formGroupWrapper.appendChild(groupWrapper);

                for (const field of formGroup.getFields()) {
                    const fieldWrapper = document.createElement('div');
                    fieldWrapper.className = 'summary-field-wrapper';
                    groupWrapper.appendChild(fieldWrapper);
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
            
        }

        
        for (const i in this.form.summaryConfirmation) {
            console.log('C:', this.form.summaryConfirmation[i]);
            const confirmationWrapper = document.createElement('div');
            confirmationWrapper.className = 'summary-confirmation-wrapper';

            const checkbox = new CheckboxField(`confirmation-${i}`, this.form.summaryConfirmation[i], '');
            checkbox.addOption('confirm', '', false);
            confirmationWrapper.appendChild(checkbox.getContent());
            this.content.appendChild(confirmationWrapper);  
        }
        
    }
}