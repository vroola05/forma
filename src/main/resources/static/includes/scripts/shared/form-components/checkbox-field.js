import { InputNucleus } from './interface/input-base.js';


/**
 * CheckboxField
 */
export class CheckboxField extends InputNucleus {
    inputElements = [];
    values = [];

    constructor(name, label, classes) {
        super(name, label);
        this.classes = classes;
        this.createElement();
    }

    /**
     * 
     */
    createElement() {
        // this.content.className = 'mb-2 row field-wrapper' + (this.classes ? ' ' + this.classes : '');
        this.inputElement = document.createElement('div');
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
    addOption(value, text, checked = false) {
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
            const checkboxInputField = e.target.closest('.checkbox-input-field');
            if (e.target.checked) {
                this.addInputValue({ value: checkboxInputField.value, text: checkboxInputField.dataset.text });
            } else {
                this.removeInputValue({ value: checkboxInputField.value, text: checkboxInputField.dataset.text });
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

        this.inputElements.push({'checkbox': checkboxElement, 'label': checkboxLabelElement});
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
    addOptions(options) {
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
    setPlaceholder(placeholder) {
        console.error('placeholder not supported on checkbox');
        return this;
    }

    /**
     * Deze functie is gekoppeld aan de input change event van de checkbox input.
     */
    addInputValue(opt, noCallback = false) {
        const option = this.values.find(o => o.value === opt.value);
        if (option) 
            return this;

        this.values.push(opt);

        this.valueChanged(noCallback, this.values);

        return this;
    }

    /**
     * 
     * @param {*} opt 
     * @param {*} noCallback 
     * @returns 
     */
    removeInputValue(opt, noCallback = false) {
        const index = this.values.findIndex(o => o.value === opt.value);
        if (index == -1) 
            return this;

        this.values.splice(index, 1);

        this.valueChanged(noCallback, this.values);

        return this;
    }

    /**
     * 
     */
    setValue(options, noCallback = false) {
        if (!options || !Array.isArray(options)) {
            return this;
        }
        
        const optionMap = new Map(options.map(o => [String(o.value), o]))
        this.inputElements.forEach(input => {
            const val = String(input.checkbox.value);
            const match = optionMap.get(val);

            if (match) {
                input.checkbox.checked = true;
                this.values.push(match);
            } else {
                input.checkbox.checked = false; // Optioneel: vink uit als niet in options
            }
        });

        this.valueChanged(noCallback, this.values);
        return this;
    }

    /**
     * 
     * @returns 
     */
    getOptions() {
        return this.values;
    }

    /**
     * 
     * @returns 
     */
    clone() {
        const checkboxField = new CheckboxField(this.name, this.label);

        [...this.inputElements].forEach(inputElement => {
            checkboxField.addOption(inputElement.checkbox.value, inputElement.checkbox.dataset.text);
        });

        checkboxField.setClasses(this.classes);
        checkboxField.value = this.value;
        checkboxField.required = this.required;
        checkboxField.data = this.data;
        checkboxField.validators = this.validators;
        return checkboxField;
    }

    /**
     * 
     * @param {*} index 
     * @returns 
     */
    createInputId(index) {
        return `${this.id}-${index}`;
    }

    /**
     * 
     * @param {*} id 
     */
    setId(id) {
        this.id = id;
        for (const i in this.inputElements) {
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

    setReadonly(readonly) {
        if (readonly === undefined) {
            readonly = false;
        }
        this.readonly = readonly;

        [...this.inputElements].forEach(inputElement => {
            inputElement.checkbox.readonly = readonly;
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