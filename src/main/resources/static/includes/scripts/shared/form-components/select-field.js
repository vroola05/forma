import { InputNucleus } from './interface/input-base.js';

/**
 * Selectbox
 */
export class SelectField extends InputNucleus {
    constructor(name, label, classes) {
        super(name, label);
        this.type = 'text';
        this.classes = classes;
        this.createElement();
    }

    createElement() {
        // Input
        this.inputElement = document.createElement('select');
        this.inputElement.className = 'form-select';
        this.inputElement.name = this.name;
        this.inputElement.id = this.name;
        this.inputElement.placeholder = this.placeholder;

        this.inputElement.onchange = (e) => { this.onChange(e) };
        
        this.createInput(this.inputElement);
    }

    onChange(e) {
        if (this.readonly) {
            return false;
        }
        const selectedOption = e.target.options[e.target.selectedIndex];
        this.setValue({ value: e.target.value, text: selectedOption.text });
    }

    addOption(value, text) {
        if (!this.inputElement) {
            throw new Error('Input element is not created yet. Call createElement() first.');
        }
        
        const option = document.createElement('option');
        option.value = value;
        option.textContent = text;
        this.inputElement.appendChild(option);

        return this;
    }

    addOptions(options) {
        if (!this.inputElement) {
            throw new Error('Input element is not created yet. Call createElement() first.');
        }
        options.forEach(option => {
            this.addOption(option.value, option.text);
        });
        return this;
    }

    setPlaceholder(placeholder) {
        const option = document.createElement('option');
        option.textContent = this.nullOrUndefined(placeholder);
        option.disabled = true;
        option.selected = true;

        this.inputElement.insertBefore(option, this.inputElement.firstChild);

        return this;
    }

    getOptions() {
        return this.value ? [this.value] : [];
    }

    getValue() {
        if (!this.value)
            return '';

        return (typeof this.value === 'string') ? this.value : this.value.value;
    }

    setValue(value, noCallback = false) {
        
        if (value=== undefined || value === null) {
            this.value = '';
            this.inputElement.selectedIndex = -1;
        } else if (typeof value === 'string') {
            this.inputElement.value = value;
            const opt = this.inputElement.options[this.inputElement.selectedIndex];
            if (opt) {
                this.value = {value, text: this.inputElement.options[this.inputElement.selectedIndex].text};
            }
        } else {
            this.value = value;
            this.inputElement.value = value.value;
        }

        this.valueChanged(noCallback);

        return this;
    }

    clone() {
        const selectField = new SelectField(this.name, this.label);
        [...this.inputElement.options].forEach(option => {
            const clone = option.cloneNode(true)
            clone.selected = option.selected;
            selectField.inputElement.add(clone);
        });

        
        selectField.setClasses(this.classes);
        selectField.required = this.required;
        selectField.setReadonly(this.readonly);
        selectField.minLength = this.minLength;
        selectField.maxLength = this.maxLength;
        selectField.validators = this.validators;
        selectField.data = this.data;
        selectField.setValue(this.value);
        return selectField;
    }
}
