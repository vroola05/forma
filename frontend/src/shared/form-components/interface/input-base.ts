import { OptionDto, TranslationDto } from '../../model/types';
import { FieldService } from '../../services/field-service';
import { Lang } from '../../services/lang';
import { Nucleus } from './nucleus';

export const InputLayout = ['no-label', 'layout-row', 'layout-column'];

export class InputNucleus <T extends HTMLElement = HTMLElement> extends Nucleus {
    content: HTMLDivElement = document.createElement('div');
    labelElement: HTMLLabelElement = document.createElement('label');
    inputWrapper: HTMLDivElement = document.createElement('div');
    feedbackElement: HTMLDivElement = document.createElement('div');
    
    inputElement: T;
    
    errors: string[] = [];

    value: any = '';

    readonly: boolean = false;
    required: boolean = false;

    callback: ((name: string, value: string, field: InputNucleus) => void)[] = [];
    
    validators: ((value: string) => boolean)[] = [];

    constructor(
            element: T, 
            name: string,
            labels: TranslationDto[] | undefined = undefined,
            id: string | undefined = undefined,
            prefix: string | undefined = undefined) {

        super(name, labels, id, prefix);
        this.inputElement = element;
    }

    afterFormInit() {
        super.afterFormInit();

        const value = FieldService.getFieldValue(this.getId());
        if (value) {
            this.setValue(value, true);
        }
    }

    createInput(inputElement: HTMLElement | undefined = undefined, showLabel: boolean = true) {
        this.content.className = ' ' + (!this.classes ? '' : this.classes);
        this.content.classList.add('field-wrapper');
        this.setLayout(InputLayout[0]);

        // Label
        this.labelElement.className = 'col-form-label field-wrapper-label';
        this.labelElement.htmlFor = this.getId();
        if (this.label || this.labels) {
            this.labelElement.innerHTML = this.getLabel();
        }
        this.showLabel(showLabel);        
        this.inputWrapper.className = 'field-wrapper-input';

        this.feedbackElement.className = 'invalid-feedback';

        if (inputElement) {
            this.inputWrapper.appendChild(inputElement);
        }

        this.inputWrapper.appendChild(this.feedbackElement);
        this.content.appendChild(this.labelElement);
        this.content.appendChild(this.inputWrapper);
    }

    showLabel(show: boolean) {
        if (show) {
            this.labelElement.classList.remove('hidden');
        } else {
            this.labelElement.classList.add('hidden');
        }
    }

    hasOptions() {
        return this.type === 'radio' || this.type === 'checkbox' || this.type === 'select' || this.type === 'file';
    }

    getValue() {
        return this.value ? this.value : '';
    }

    getOptions(): OptionDto[] {
        return [];
    }

    #isInput(): boolean {
        return this.inputElement instanceof HTMLInputElement;
    }

    #getInput(): HTMLInputElement {
        return (this.inputElement as unknown as HTMLInputElement);
    }

    setLabel(label: string | undefined) {
        super.setLabel(label);
        
        if (this.label || this.labels) {
            this.labelElement.innerHTML = this.getLabel();
        }

        return this;
    }

    setValue(value: any, noCallback: boolean = false, fromUi: boolean = false) {
        this.value = value ?? '';

        if (!fromUi && this.#isInput()) {
            this.#getInput().value = this.value;
        }

        this.valueChanged(noCallback);
        return this;
    }

    valueChanged(noCallback: boolean = false, value: any = undefined) {
        if (!noCallback) {
            FieldService.setFieldValue(this.getId(), this.value);

            if (this.callback.length > 0) {
                this.callback.forEach( callback => {
                    callback(this.name, value ? value : this.value, this);
                });
            }
        }
    }

    addValueChangedListener(callback: (name: string, value: any, field: InputNucleus) => void) {
        if (!callback) {
            return this;
        }
        if (typeof callback !== 'function') {
            throw new Error('Callback must be a function');
        }
        this.callback.push(callback);
        return this;
    }

    setReadonly(readonly: boolean | undefined = undefined) {
        readonly ??= false;
        this.readonly = readonly;
        if (this.#isInput()) {
            this.#getInput().readOnly = readonly;
            this.#getInput().disabled = readonly;
        }

        if (readonly) {
            this.inputElement.classList.add('readonly');
            this.inputElement.setAttribute('aria-readonly', 'true');
        } else {
            this.inputElement.classList.remove('readonly');
            this.inputElement.removeAttribute('aria-readonly');
        }


        return this;
    }

    setRequired(required: boolean = false) {
        this.required = required;
        if (this.#isInput()) {
            this.#getInput().required = required;
        }
        if (required ) {
            if (!this.labelElement.classList.contains('required')) {
                this.labelElement.classList.add('required');
            }
        } else {
            this.labelElement.classList.remove('required');
        }
            
        return this;
    }

    setPlaceholder(placeholder: string | undefined = undefined) {
        if (this.#isInput()) {
            this.#getInput().placeholder = placeholder ?? '';
        }
        return this;
    }

    setLayout(layout: string) {
        if (InputLayout.includes(layout)) {
            switch (layout) {
                case 'layout-row':
                    this.content.classList.remove('layout-column');
                    this.content.classList.add('layout-row');
                    break;
                case 'layout-column':
                    this.content.classList.remove('layout-row');
                    this.content.classList.add('layout-column');
                    break;
            }
        }
        return this;
    }

    validate(valid = true, message = '') {
        this.errors = [];
        this.inputElement.classList.remove('is-valid', 'is-invalid');

        if (this.required && !this.getValue()) {
            this.errors.push(Lang.get('generic.validation.required'));
            valid = false;
        } else if (!valid) {
            this.errors.push(message);
        } else {

            if (this.type === 'email' && this.getValue() && !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(this.getValue())) {
                this.errors.push(Lang.get('generic.validation.email'));
                valid = false;
            }
            if (this.type === 'number' && this.getValue() && Number.isNaN(Number(this.getValue()))) {
                this.errors.push(Lang.get('generic.validation.number'));
                valid = false;
            }
            if (this.type === 'date' && this.getValue() && Number.isNaN(Date.parse(this.getValue()))) {
                this.errors.push(Lang.get('generic.validation.date'));
                valid = false;
            }

        }

        this.setValidationState(valid);

        return valid;
    }

    setBackendErrorsField(valid: boolean, errors: string | string[] | undefined = undefined) {
        this.errors = [];

        if (errors) {
            if (Array.isArray(errors)) {
                errors.forEach(error => {this.errors.push(error);})
            } else {
                this.errors.push(errors);
            }
            
            this.setValidationState(valid);
        }
    }

    setValidationState(valid: boolean) {
        if (valid === false) {
            this.feedbackElement.classList.remove('is-valid');
            this.feedbackElement.classList.add('is-invalid');

            this.inputElement.classList.remove('is-valid');
            this.inputElement.classList.add('is-invalid');
            this.feedbackElement.innerHTML = this.errors.join('<br />');
        } else {
            this.feedbackElement.classList.remove('is-invalid');
            this.feedbackElement.classList.add('is-valid');
            
            this.inputElement.classList.remove('is-invalid');
            this.inputElement.classList.add('is-valid');
            this.feedbackElement.textContent = '';
        }
    }

    getInput() {
        return this.inputElement;
    }

    clone(): InputNucleus {
        throw Error('Not implemented');
    }
}
