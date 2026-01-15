import { Nucleus } from './nucleus.js';

export class InputNucleus extends Nucleus {

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

        if (!label) {
            throw new Error('Label is a required parameter');
        }
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
    }

    getValue() {
        return this.value ? this.value : '';
    }

    setValue(value, noCallback = false) {
        this.value = value;
        this.inputElement.value = value;
        if (!noCallback && this.callback.length > 0) {
            this.callback.forEach( callback => {
                callback(this.name, value, this);
            });
        }
        return this;
    }

    setData(data) {
        if (data) {
            for (const key of Object.keys(data)) {
                this.data.set(key, data[key]);
            }
        }
        return this;
    }

    addValueChangedListener(callback) {
        if (typeof callback !== 'function') {
            throw new Error('Callback must be a function');
        }
        this.callback.push(callback);

        
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
        return this;
    }

    setPlaceholder(placeholder) {
        this.inputElement.placeholder = placeholder;
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
            this.errors.push('Dit veld is verplicht.');
            valid = false;
        } else if (!valid) {
            this.errors.push(message);
        } else {
            if (this.type === 'email' && this.getValue() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.getValue())) {
                this.errors.push('Dit is geen geldig email adres.');
                valid = false;
            }
            if (this.type === 'number' && this.getValue() && isNaN(this.getValue())) {
                this.errors.push('Dit veld geen geldig nummer.');
                valid = false;
            }
            if (this.type === 'date' && this.getValue() && isNaN(Date.parse(this.getValue()))) {
                this.errors.push(`Dit ${this.getValue()} veld is geen geldige datum.`);
                valid = false;
            }

        }

        this.setvalidationState(valid);

        return valid;
    }

    setvalidationState(valid) {
        if (valid == false) {
            this.inputElement.classList.remove('is-valid');
            this.inputElement.classList.add('is-invalid');
            this.feedbackElement.textContent = this.errors.join(' ');
        } else {
            this.inputElement.classList.remove('is-invalid');
            this.inputElement.classList.add('is-valid');
            this.feedbackElement.textContent = '';
        }
    }

    getInput() {
        return this.inputElement;
    }

}
