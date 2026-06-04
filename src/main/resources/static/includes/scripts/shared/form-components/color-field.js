import { InputNucleus } from './interface/input-base.js';

/**
 * Colorfield
 */
export class ColorField extends InputNucleus {
    
    minLength = undefined;
    maxLength = undefined;

    constructor(name, label) {
        super(name, label);
        this.type = 'color-field';

        this.createElement();
    }

    createElement() {
        const inputInnerWrapper = document.createElement('div');
        inputInnerWrapper.className = 'field-inner-wrapper-input';

        // Input
        this.inputElement = document.createElement('input');
        this.inputElement.className = 'form-control';
        this.inputElement.name = this.name;
        this.inputElement.id = this.name;
        this.inputElement.type = 'text';
        this.inputElement.addEventListener('change', (e) => {
            if (!this.#validateColor(e.target.value)) {
                return;
            }
            this.setValue(e.target.value, false, true);
            this.colorPickerElement.value = e.target.value;
            
        });
        
        this.colorPickerElement = document.createElement('input');
        this.colorPickerElement.className = 'form-control color-field';
        this.colorPickerElement.name = this.name;
        this.colorPickerElement.id = this.name;
        this.colorPickerElement.type = 'color';
        this.colorPickerElement.addEventListener('change', (e) => {
            this.#validateColor(e.target.value);
            this.inputElement.value = e.target.value;
            this.setValue(e.target.value, false, true);
        });
        
        inputInnerWrapper.append(this.inputElement, this.colorPickerElement);

        this.createInput(inputInnerWrapper);
    }

    setType(type) {
        this.type = type;
        
        return this;
    }


    setValue(value, noCallback = false, fromUi = false) {
        this.value = value ?? '';
        
        if (!fromUi) {
            this.inputElement.value = this.value;
            this.colorPickerElement.value = this.value;
        }

        this.valueChanged(noCallback);
        return this;
    }

    validate(valid = true, message = '') {
        if (!this.getShow()) {
            return true;
        }
        valid = super.validate(valid, message);
        
        const value = this.getValue();
        
        if (value !== '' && !new RegExp('^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$').test(value)) {
            this.errors.push(`Ongeldige kleurcode. Gebruik een hex-code zoals #RRGGBB of #RGB.`);
            valid = false;
        
        }

        this.setValidationState(valid);
        return valid;
    }

    #validateColor(value) {
        this.errors = [];
        this.feedbackElement.textContent = '';
        this.feedbackElement.classList.remove('is-invalid');

        if (value !== '' && !new RegExp('^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$').test(value)) {
            this.errors.push(`Ongeldige kleurcode. Gebruik een hex-code zoals #RRGGBB of #RGB.`);
            this.feedbackElement.classList.add('is-invalid');
            this.feedbackElement.innerHTML = this.errors.join('<br />');
            return false;
        }

        
        return true;
    }

    clone() {
        const colorfield = new ColorField(this.name, this.label);
        colorfield.setType(this.type);
        colorfield.setValue(this.value);
        colorfield.setClasses(this.classes);
        colorfield.setRequired(this.required);
        colorfield.setReadonly(this.readonly);
        colorfield.setMinLength(this.minLength);
        colorfield.setMaxLength(this.maxLength);
        colorfield.data = this.data;
        colorfield.validators = this.validators;
        return colorfield;
    }
}