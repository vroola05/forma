import { Nucleus } from './nucleus.js';
import { FormService } from '../../../form-viewer/services/form-service.js';
import { Lang } from '../../services/lang.js';

export const InputLayout = ['no-label', 'layout-row', 'layout-column'];

export class InputNucleus extends Nucleus {
    content = document.createElement('div');
    labelElement = document.createElement('label');

    #persistenceEnabled = false;

    value = '';
    id = '';

    data = new Map();

    errors = [];

    readonly = false;
    required = false;

    callback = [];
    
    validators = [];

    constructor(name, label) {
        super(name, label);
    }

    createInput(inputElement = undefined) {
        this.content.className = ' ' + (!this.classes ? '' : this.classes);
        this.content.classList.add('field-wrapper');
        this.setLayout(InputLayout[0]);

        // Label
        this.labelElement.className = 'col-form-label field-wrapper-label';
        this.labelElement.htmlFor = this.name;
        this.labelElement.innerHTML = this.label;

        // Input wrapper
        this.inputWrapper = document.createElement('div');
        this.inputWrapper.className = 'field-wrapper-input';

        this.feedbackElement = document.createElement('div');
        this.feedbackElement.className = 'invalid-feedback';

        

        if (inputElement) {
            this.inputWrapper.appendChild(inputElement);
        }

        this.inputWrapper.appendChild(this.feedbackElement);
        this.content.appendChild(this.labelElement);
        this.content.appendChild(this.inputWrapper);
    }

    hasOptions() {
        return this.type === 'radio' || this.type === 'checkbox' || this.type === 'select'
    }

    getId() {
        return this.id;
    }

    setId(id) {
        this.id = id;
        this.inputElement.name = id;
        this.inputElement.id = id;
        this.labelElement.htmlFor = id;
        return this;
    }

    getValue() {
        return this.value ? this.value : '';
    }

    setValue(value, noCallback = false, fromUi = false) {
        this.value = value ?? '';

        if (!fromUi) {
            this.inputElement.value = this.value;
        }

        this.valueChanged(noCallback);
        return this;
    }

    valueChanged(noCallback, value = undefined) {
        if (!noCallback) {
            this.saveState();

            if (this.callback.length > 0) {
                this.callback.forEach( callback => {
                    callback(this.name, value ? value : this.value, this);
                });
            }
        }
    }

    setData(data) {
        if (data) {
            for (const key of Object.keys(data)) {
                this.data.set(key, data[key]);
            }
        }
        return this;
    }

    enablePersistence(enabled) {
        this.#persistenceEnabled = enabled;
        return this;
    }

    saveState() {
        if (this.#persistenceEnabled) {
            FormService.getInstance().saveState();
        }
    }

    addValueChangedListener(callback) {
        if (typeof callback !== 'function') {
            throw new Error('Callback must be a function');
        }
        this.callback.push(callback);
        return this;
    }

    setReadonly(readonly) {
        if (readonly === undefined) {
            readonly = false;
        }
        this.readonly = readonly;
        this.inputElement.readonly = readonly;
        this.inputElement.disabled = readonly;
        if (readonly) {
            this.inputElement.classList.add('readonly');
            this.inputElement.setAttribute('aria-readonly', 'true');
        } else {
            this.inputElement.classList.remove('readonly');
            this.inputElement.removeAttribute('aria-readonly');
        }


        return this;
    }

    setRequired(required) {
        this.required = required;
        this.inputElement.required = required;
        if (required ) {
            if (!this.labelElement.classList.contains('required')) {
                this.labelElement.classList.add('required');
            }
        } else {
            this.labelElement.classList.remove('required');
        }
            
        return this;
    }

    setPlaceholder(placeholder) {
        this.inputElement.placeholder = placeholder ?? '';
        return this;
    }

    setLayout(layout) {
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

    addValidator(validator, message) {
        if (typeof validator !== 'function') {
            throw new Error('Validator must be a function');
        }
        this.validators.push({ validator, message });

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
            if (this.type === 'number' && this.getValue() && isNaN(this.getValue())) {
                this.errors.push(Lang.get('generic.validation.number'));
                valid = false;
            }
            if (this.type === 'date' && this.getValue() && isNaN(Date.parse(this.getValue()))) {
                this.errors.push(Lang.get('generic.validation.date'));
                valid = false;
            }

        }

        this.setValidationState(valid);

        return valid;
    }

    setBackendErrors(valid, errors = undefined) {
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

    setValidationState(valid) {
        if (valid == false) {
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
}
