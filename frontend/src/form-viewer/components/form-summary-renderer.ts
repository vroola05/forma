import { Form } from '../../shared/form-components/form';
import { InputNucleus } from '../../shared/form-components/interface/input-base';
import { Nucleus } from '../../shared/form-components/interface/nucleus';
import { Tab } from '../../shared/form-components/tab';
import { FormRenderer } from '../../shared/generic-components/form-renderer';
import { FormService } from '../services/form-service';

export class FormSummaryRenderer {
    content = document.createElement('div');
    tabWrapper = document.createElement('div');
    formService = FormService.getInstance();
    form: Form | undefined;
    

    constructor() {
        this.createElement();
    }

    createElement() {
        this.content = document.createElement('div');
        this.content.className = 'form-summary-renderer';
    }

    getContent() {
        return this.content;
    }

    onActiveChange(active: boolean) {

        this.form = this.formService.form;

        this.content.innerHTML = '';
        this.tabWrapper.innerHTML = '';

        if (!this.form) return;
        this.tabWrapper.className = 'summary-tab-wrapper';
        this.content.appendChild(this.tabWrapper);

        for (const tabPage of this.form.getFields()) {
            this.#renderTab(tabPage);
        }

        this.#createConfirmation();
    }

    #renderTab(tabPage: Tab) {
        
        if (tabPage.getName() === 'summary') {
                return;
            }
            if (!tabPage.getShow()) {
                return;
            }

            const label = tabPage.getLabel();
            
            const tabWrapperInner = document.createElement('div');
            tabWrapperInner.className = 'summary-tab-wrapper-inner';
            this.tabWrapper.appendChild(tabWrapperInner);
            
            if (label !== undefined) {
                tabWrapperInner.appendChild(document.createElement('h2')).innerText = label;
            }

            for (const formGroup of tabPage.getFields()) {
                this.#routeField(formGroup, tabWrapperInner);
            }
    }

    #routeField(field: Nucleus, container: HTMLElement) {
        if (!field.getShow()) {
            return;
        }

        if (field.getType() === 'form-group') {
            this.#renderFormGroup(field, container);
        } else {
            this.#renderField(field as InputNucleus, container);
        }
    }

    #renderFormGroup(formGroup: Nucleus, container: HTMLElement) {
        if (!this.form) return;
        const formGroupWrapper = document.createElement('div');
        formGroupWrapper.className = 'summary-form-group-wrapper';
        container.appendChild(formGroupWrapper);

        const label = formGroup.getLabel();
        if (label) {
            formGroupWrapper.appendChild(document.createElement('h3')).innerText = label;
        }

        const groupWrapper = document.createElement('div');
        groupWrapper.className = 'summary-form-group';
        formGroupWrapper.appendChild(groupWrapper);

        const fields = formGroup.getFields();
        if (fields === null) {
            return;
        }

        for (const field of fields) {
            this.#renderField(field as InputNucleus, groupWrapper);
        }
    }

    #renderField(field: InputNucleus, container: HTMLElement) {
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
        
        if (FormRenderer.isOptionType(field.type)) {
            fieldValue.innerHTML = !field.getOptions() || field.getOptions().length === 0 ? '' : '<ul>' + field.getOptions().map(option => `<li>${option.text}</li>`).join('') + '</ul>';
        } else {
            fieldValue.innerText = field.getValue() || '';
        }
        
        fieldWrapper.appendChild(fieldValue);
    }

    #createConfirmation() {
        if (!this.form) return;
        const tabWrapperInner = document.createElement('div');
        tabWrapperInner.className = 'summary-tab-wrapper-inner';
        this.tabWrapper.appendChild(tabWrapperInner);
        
        const confirmations = this.form.getConfirmationCheck();
        if (confirmations) {
            for (const confirmation of confirmations) {
                const confirmationWrapper = document.createElement('div');
                confirmationWrapper.className = 'summary-confirmation-wrapper';

                confirmationWrapper.appendChild(confirmation.getContent());
                tabWrapperInner.appendChild(confirmationWrapper);
            }
        }
    }
}