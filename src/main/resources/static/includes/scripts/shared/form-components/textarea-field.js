import { InputNucleus } from './interface/input-base.js';

/**
 * Textfield
 */
export class TextAreaField extends InputNucleus {
    
    minLength = undefined;
    maxLength = undefined;

    constructor(name, label) {
        super(name, label);
        this.type = 'textarea';

        this.createElement();
    }

    createElement() {
        // Input
        this.inputElement = document.createElement('textarea');
        this.inputElement.className = 'form-control';
        this.inputElement.name = this.name;
        this.inputElement.id = this.name;
        
        this.inputElement.value = this.getValue();
        
        this.inputElement.addEventListener('change', (e) => {
            this.setValue(e.target.value);
        });
        this.createInput(this.inputElement);

    }

    setMinLength(length, message = 'Minimale lengte is ' + length) {
        if (length === null || length === undefined) {
            this.minLength = undefined;
            this.inputElement.removeAttribute('minLength');
        } else {
            this.minLength = length;
            this.inputElement.minLength = length;
        }
        return this;
    }

    setMaxLength(length, message = 'Maximale lengte is ' + length) {
        if (length === null || length === undefined) {
            this.maxLength = undefined;
            this.inputElement.removeAttribute('maxLength');
        } else {
            this.maxLength = length;
            this.inputElement.maxLength = length;
        }
        return this;
    }

    validate(valid = true, message = '') {
        valid = super.validate(valid, message);
        if (valid) {
            if (this.minLength && this.getValue().length < this.minLength) {
                this.errors.push(`Minimaal ${this.minLength} tekens vereist.`);
                valid = false;
            }
            if (this.maxLength && this.maxLength != null && this.getValue().length > this.maxLength) {
                this.errors.push(`Maximaal ${this.maxLength} tekens toegestaan.`);
                valid = false;
            }
        }

        this.setvalidationState(valid);
        return valid;
    }

    clone() {
        const textfield = new TextAreaField(this.name, this.label);
        textfield.setType(this.type);
        textfield.setValue(this.value);
        textfield.setClasses(this.classes);
        textfield.setRequired(this.required);
        textfield.setReadonly(this.readonly);
        textfield.setMinLength(this.minLength);
        textfield.setMaxLength(this.maxLength);
        textfield.data = this.data;
        textfield.validators = this.validators;
        return textfield;
    }
}
