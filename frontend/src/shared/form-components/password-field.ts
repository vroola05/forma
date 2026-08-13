import { InputNucleus } from './interface/input-base';

/**
 * Textfield
 */
export class PasswordField extends InputNucleus<HTMLInputElement> {
        minLength: number | undefined = undefined;
    maxLength: number | undefined = undefined;

    constructor(name: string, label: string | undefined, id: string | undefined = undefined) {
        super(document.createElement('input'),name, label, id);
        this.type = 'password';

        this.createElement();
    }

    createElement() {
        // Input
        this.inputElement.className = 'form-control';
        this.inputElement.name = this.name;
        this.inputElement.id = this.getId();
        this.inputElement.value = this.getValue();
        this.inputElement.type = this.type;
        
        this.inputElement.addEventListener('change', (e) => {
            this.setValue((e.target as HTMLInputElement).value);
        });

        this.createInput(this.inputElement);
    }

    setType(type: string) {
        this.type = type;
        this.inputElement.type = type;
        return this;
    }

    setMinLength(length: number | undefined) {
        if (length === null || length === undefined) {
            this.minLength = undefined;
            this.inputElement.removeAttribute('minLength');
        } else {
            this.minLength = length;
            this.inputElement.minLength = length;
        }
        return this;
    }

    setMaxLength(length: number | undefined) {
        if (length === null || length === undefined) {
            this.maxLength = undefined;
            this.inputElement.removeAttribute('maxLength');
        } else {
            this.maxLength = length;
            this.inputElement.maxLength = length;
        }
        return this;
    }

    validate(valid: boolean = true, message: string = '') {
        if (!this.getShow()) {
            return true;
        }
        valid = super.validate(valid, message);
        if (valid) {
            if (this.minLength && this.getValue().length < this.minLength) {
                this.errors.push(`Minimaal ${this.minLength} tekens vereist.`);
                valid = false;
            }
            if (this.maxLength && this.maxLength !== null && this.getValue().length > this.maxLength) {
                this.errors.push(`Maximaal ${this.maxLength} tekens toegestaan.`);
                valid = false;
            }
        }

        this.setValidationState(valid);
        return valid;
    }

    clone() {
        const passwordfield = new PasswordField(this.name, this.label);
        passwordfield.setType(this.type);
        passwordfield.setValue(this.value);
        passwordfield.setClasses(this.classes);
        passwordfield.setRequired(this.required);
        passwordfield.setReadonly(this.readonly);
        passwordfield.setMinLength(this.minLength);
        passwordfield.setMaxLength(this.maxLength);
        passwordfield.validators = this.validators;
        return passwordfield;
    }
}