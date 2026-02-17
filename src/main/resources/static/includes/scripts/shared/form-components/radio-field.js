import { InputNucleus } from './interface/input-base.js';

/**
 * Radiobox
 */
export class RadioField extends InputNucleus {
    inputElements = [];

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
        this.inputElement.className = 'radio-input-wrapper';
        this.createInput(this.inputElement);
    }

    setReadonly(readonly) {
        if (readonly === undefined) {
            readonly = false;
        }
        this.readonly = readonly;

        [...this.inputElements].forEach(inputElement => {
            inputElement.radio.readonly = readonly;
            inputElement.radio.disabled = readonly;
            if (readonly) {
                inputElement.radio.classList.add('readonly');
                inputElement.radio.setAttribute('aria-readonly', 'true');
            } else {
                inputElement.radio.classList.remove('readonly');
                inputElement.radio.removeAttribute('aria-readonly');
            }
        });

        return this;
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

        const radioElementContainer = document.createElement('div');
        radioElementContainer.className = 'radio-input-container form-check';

        const radioElement = document.createElement('input');
        radioElement.type = 'radio';
        radioElement.name = this.name;
        radioElement.className = 'radio-input-field form-check-input';
        radioElement.value = value;
        radioElement.id = id;
        radioElement.setAttribute('data-text', text);
        radioElement.addEventListener('change', (e) => {
            const radioInputField = e.target.closest('.radio-input-field');
            this.setInputValue({ value: radioInputField.value, text: radioInputField.dataset.text });
        });
        radioElementContainer.appendChild(radioElement);

        const radioLabelElement = document.createElement('label');
        radioLabelElement.className = 'form-check-label';
        radioLabelElement.htmlFor = id;
        radioLabelElement.textContent = text;
        radioElementContainer.appendChild(radioLabelElement);

        this.inputElements.push({'radio': radioElement, 'label': radioLabelElement});
        this.inputElement.appendChild(radioElementContainer);

        if (checked) {
            this.setValue({value, text});
        }
        return this;
    }

    /**
     * 
     * @param {*} options 
     * @returns 
     */
    addOptions(options) {
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
        console.error('placeholder not supported on radiobox');
        return this;
    }

    /**
     * Deze functie is gekoppeld aan de input change event van de radio input.
     */
    setInputValue(value, noCallback = false) {
        this.value = value;
        
        this.valueChanged(noCallback);

        return this;
    }

    /**
     * 
     */
    setValue(value, noCallback = false) {
        if (value && typeof value === 'string') {
            const item = this.inputElements.find(input => value && input.radio.value == value);
            if (item) {
                this.value = {value, text: item.radio.dataset.text};
            } else return this;
        } else {
            this.value = value;
        }

        this.inputElements.forEach(input => {
            if (this.value && input.radio.value == this.value.value) {
                input.radio.checked = true;
            } else {
                input.radio.checked = false;
            }
        });

        this.valueChanged(noCallback);
        
        return this;
    }

    /**
     * 
     * @returns 
     */
    getValue() {
        return !this.value ? '' : this.value.value;
    }

    /**
     * 
     * @returns 
     */
    getOptions() {
        return this.value ? [this.value] : [];
    }

    /**
     * 
     * @returns 
     */
    clone() {
        const radioField = new RadioField(this.name, this.label);

        [...this.inputElements].forEach(inputElement => {
            radioField.addOption(inputElement.radio.value, inputElement.radio.dataset.text);
        });

        radioField.setClasses(this.classes);
        radioField.value = this.value;
        radioField.required = this.required;
        radioField.data = this.data;
        radioField.validators = this.validators;
        return radioField;
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
            this.inputElements[i].radio.id = newId;
            this.inputElements[i].radio.name = this.id;
            this.inputElements[i].label.htmlFor = newId;
        }
        
    }
}
