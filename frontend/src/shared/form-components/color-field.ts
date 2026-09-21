import { TranslationDto } from '../model/types';
import { InputNucleus } from './interface/input-base';

/**
 * Colorfield
 */
export class ColorField extends InputNucleus<HTMLInputElement> {
    colorPickerElement = document.createElement('input');

    minLength = undefined;
    maxLength = undefined;

    constructor(name: string, labels: TranslationDto[] | undefined, id: string | undefined = undefined) {
        super(document.createElement('input'),name, labels, id);
        this.type = 'color';

        this.createElement();
    }

    createElement() {
        const inputInnerWrapper = document.createElement('div');
        inputInnerWrapper.className = 'field-inner-wrapper-input';

        // Input
        this.inputElement.className = 'form-control';
        this.inputElement.name = this.name;
        this.inputElement.id = this.getId();
        this.inputElement.type = 'text';
        this.inputElement.addEventListener('change', (e) => {
            const target = e.target as HTMLInputElement;
            if (!this.#validateColor(target.value)) {
                return;
            }
            this.setValue(target.value, false, true);
            this.colorPickerElement.value = target.value;
            
        });
        
        this.colorPickerElement.className = 'form-control color-field';
        this.colorPickerElement.name = this.name;
        this.colorPickerElement.id = `${this.getId()}-picker`;
        this.colorPickerElement.type = 'color';
        this.colorPickerElement.addEventListener('change', (e) => {
            const target = e.target as HTMLInputElement;
            this.#validateColor(target.value);
            this.inputElement.value = target.value;
            this.setValue(target.value, false, true);
        });
        
        inputInnerWrapper.append(this.inputElement, this.colorPickerElement);

        this.createInput(inputInnerWrapper);
    }

    setType(type: string) {
        this.type = type;
        
        return this;
    }


    setValue(value: string | undefined, noCallback: boolean = false, fromUi: boolean = false) {
        this.value = value ?? '';
        
        if (!fromUi) {
            this.inputElement.value = this.value;
            this.colorPickerElement.value = this.value;
        }

        this.valueChanged(noCallback);
        return this;
    }

    validate(valid: boolean = true, message: string = '') {
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

    #validateColor(value: string) {
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
        const colorfield = new ColorField(this.name, this.labels);
        colorfield.setType(this.type);
        colorfield.setValue(this.value);
        colorfield.setClasses(this.classes);
        colorfield.setRequired(this.required);
        colorfield.setReadonly(this.readonly);
        colorfield.validators = this.validators;
        return colorfield;
    }
}