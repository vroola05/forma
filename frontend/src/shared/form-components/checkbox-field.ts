import { OptionDto, TranslationDto } from '../model/types';
import { InputNucleus } from './interface/input-base';

/**
 * CheckboxField
 */
export class CheckboxField extends InputNucleus<HTMLDivElement> {
    inputElements: { checkbox: HTMLInputElement; label: HTMLLabelElement }[] = [];
    
    value: OptionDto[];

    constructor(name: string, labels: TranslationDto[] | undefined, classes: string, id: string | undefined = undefined) {
        super(document.createElement('div'), name, labels, id);
        this.value = [];
        this.classes = classes;
        this.createElement();
    }

    /**
     * 
     */
    createElement() {
        this.inputElement.className = 'checkbox-input-wrapper';

        this.createInput(this.inputElement);
    }

    /**
     * 
     * @param {*} value 
     * @param {*} text 
     * @param {*} checked 
     * @returns 
     */
    addOption(value: string, text: string, checked: boolean = false) {
        if (!this.inputElements) {
            throw new Error('Input element is not created yet. Call createElement() first.');
        }
        const id = this.createInputId(this.inputElements.length);

        const checkboxElementContainer = document.createElement('div');
        checkboxElementContainer.className = 'checkbox-input-container form-check';

        const checkboxElement = document.createElement('input');
        checkboxElement.type = 'checkbox';
        checkboxElement.name = this.name;
        checkboxElement.className = 'checkbox-input-field form-check-input';
        checkboxElement.value = value;
        checkboxElement.id = id;
        checkboxElement.setAttribute('data-text', text);
        checkboxElement.addEventListener('change', (e) => {
            const target = (e.target as HTMLInputElement);
            const checkboxInputField = target.closest('.checkbox-input-field') as HTMLInputElement;
            if (!checkboxInputField) {
                return;
            }

            if (target.checked) {
                this.addInputValue({ value: checkboxInputField.value, text: checkboxInputField.dataset.text || '' });
            } else {
                this.removeInputValue({ value: checkboxInputField.value, text: checkboxInputField.dataset.text || '' });
            }
            
        });
        checkboxElementContainer.appendChild(checkboxElement);

        const checkboxLabelElement = document.createElement('label');
        checkboxLabelElement.className = 'form-check-label';
        checkboxLabelElement.htmlFor = id;
        if (text) {
            checkboxLabelElement.textContent = text;
        }
        
        checkboxElementContainer.appendChild(checkboxLabelElement);

        this.inputElements.push({
            checkbox: checkboxElement,
            label: checkboxLabelElement
        });
        this.inputElement.appendChild(checkboxElementContainer);

        if (checked) {
            this.setValue([{value, text}], true);
        }
        return this;
    }

    /**
     * 
     * @param {*} options 
     * @returns 
     */
    addOptions(options: OptionDto[] | undefined) {
        if (!options)
            return this;
        
        options.forEach(option => {
            this.addOption(option.value, option.text, option.selected);
        });
        return this;
    }

    /**
     * 
     * @param {*} placeholder 
     * @returns 
     */
    setPlaceholder(placeholder: string) {
        return this;
    }

    /**
     * Deze functie is gekoppeld aan de input change event van de checkbox input.
     */
    addInputValue(opt: OptionDto, noCallback = false) {
        const option = this.value.find(o => o.value === opt.value);
        if (option) 
            return this;

        this.value.push(opt);

        this.valueChanged(noCallback, this.value);
        return this;
    }

    /**
     * 
     * @param {*} opt 
     * @param {*} noCallback 
     * @returns 
     */
    removeInputValue(opt: OptionDto, noCallback = false) {
        const index = this.value.findIndex(o => o.value === opt.value);
        if (index === -1) 
            return this;

        this.value.splice(index, 1);

        this.valueChanged(noCallback, this.value);
        return this;
    }

    /**
     * 
     */
    setValue(options: OptionDto[] | undefined, noCallback = false) {
        if (!options || !Array.isArray(options)) {
            return this;
        }
        
        const optionMap = new Map(options.map(o => [String(o.value), o]))
        this.inputElements.forEach(input => {
            const val = String(input.checkbox.value);
            const match = optionMap.get(val);

            if (match) {
                input.checkbox.checked = true;
                this.value.push(match);
            } else {
                input.checkbox.checked = false; // Optioneel: vink uit als niet in options
            }
        });

        this.valueChanged(noCallback, this.value);

        return this;
    }

    /**
     * 
     * @returns 
     */
    getOptions() {
        return this.value;
    }

    /**
     * 
     * @returns 
     */
    clone() {
        const checkboxField = new CheckboxField(this.name, this.labels, this.classes, this.id);

        [...this.inputElements].forEach(inputElement => {
            checkboxField.addOption(inputElement.checkbox.value, inputElement.checkbox.dataset.text ?? '');
        });

        checkboxField.setClasses(this.classes);
        checkboxField.value = this.value;
        checkboxField.required = this.required;
        checkboxField.validators = this.validators;
        return checkboxField;
    }

    /**
     * 
     * @param {*} index 
     * @returns 
     */
    createInputId(index: number) {
        return `${this.getId()}-${index}`;
    }

    /**
     * 
     * @param {*} id 
     */
    setId(id: string) {
        this.id = id;
        for (let i = 0; i < this.inputElements.length; i++) {
            const newId = this.createInputId(i);
            this.inputElements[i].checkbox.id = newId;
            this.inputElements[i].checkbox.name = this.id;
            this.inputElements[i].label.htmlFor = newId;
        }
        return this;
    }

     validate(valid = true, message = '') {
        this.errors = [];
        this.inputElement.classList.remove('is-valid', 'is-invalid');
            if (this.required && (!this.getOptions() || this.getOptions().length === 0  )) {
            this.errors.push('Dit veld is verplicht.');
            valid = false;
        }

        this.setValidationState(valid);
        

        return valid;
    }

    setReadonly(readonly: boolean | undefined) {
        if (readonly === undefined) {
            readonly = false;
        }
        this.readonly = readonly;

        [...this.inputElements].forEach(inputElement => {
            inputElement.checkbox.readOnly = readonly;
            inputElement.checkbox.disabled = readonly;
            if (readonly) {
                inputElement.checkbox.classList.add('readonly');
                inputElement.checkbox.setAttribute('aria-readonly', 'true');
            } else {
                inputElement.checkbox.classList.remove('readonly');
                inputElement.checkbox.removeAttribute('aria-readonly');
            }
        });

        return this;
    }
}