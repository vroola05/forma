import { Auth } from '../auth.js';
import { InputNucleus } from './interface/input-base.js';

/**
 * Textfield
 */
export class LabelField extends InputNucleus {
    
    constructor(name, label) {
        super(name, label);
        this.type = 'label';

        this.createElement();
    }

    createElement() {
        this.content = document.createElement('div');
        this.content.className = 'mb-2 row';

        // Label
        this.labelElement = document.createElement('label');
        this.labelElement.className = 'col-sm-4 col-form-label';
        this.labelElement.htmlFor = this.name;
        this.labelElement.innerHTML = this.label;

        // Input wrapper
        const inputWrapper = document.createElement('div');
        inputWrapper.className = 'col-sm-8';

        // Input
        this.inputElement = document.createElement('div');
        this.inputElement.id = this.name;
        
        this.inputElement.innerHTML = this.getValue();
        
        this.feedbackElement = document.createElement('div');
        this.feedbackElement.className = 'invalid-feedback';

        inputWrapper.appendChild(this.inputElement);
        inputWrapper.appendChild(this.feedbackElement);
        this.content.appendChild(this.labelElement);
        this.content.appendChild(inputWrapper);
    }

    setType(type) {
        this.type = type;
        this.inputElement.type = type;
        return this;
    }

    setMinLength(length, message = 'Minimale lengte is ' + length) {
        return this;
    }
    setMaxLength(length, message = 'Maximale lengte is ' + length) {
        return this;
    }

    validate() {
        return true;
    }

    setValue(value, noCallback = false) {
        this.value = value;
        this.inputElement.innerHTML = value;
        return this;
    }

    clone() {
        const labelField = new LabelField(this.name, this.label);
        labelField.setType(this.type);
        labelField.setValue(this.value);
        labelField.setClasses(this.classes);
        labelField.data = this.data;

        return labelField;
    }
}

/**
 * Textfield
 */
export class TextField extends InputNucleus {
    
    minLength = undefined;
    maxLength = undefined;

    constructor(name, label) {
        super(name, label);
        this.type = 'text';

        this.createElement();
    }

    createElement() {
        this.content = document.createElement('div');
        this.content.className = 'mb-2 row';

        // Label
        this.labelElement = document.createElement('label');
        this.labelElement.className = 'col-sm-4 col-form-label';
        this.labelElement.htmlFor = this.name;
        this.labelElement.innerHTML = this.label;

        // Input wrapper
        const inputWrapper = document.createElement('div');
        inputWrapper.className = 'col-sm-8';

        // Input
        this.inputElement = document.createElement('input');
        this.inputElement.className = 'form-control';
        this.inputElement.name = this.name;
        this.inputElement.id = this.name;
        
        this.inputElement.value = this.getValue();
        
        this.feedbackElement = document.createElement('div');
        this.feedbackElement.className = 'invalid-feedback';

        this.inputElement.addEventListener('change', (e) => {
            this.setValue(e.target.value);
        });

        inputWrapper.appendChild(this.inputElement);
        inputWrapper.appendChild(this.feedbackElement);
        this.content.appendChild(this.labelElement);
        this.content.appendChild(inputWrapper);
    }

    setType(type) {
        this.type = type;
        this.inputElement.type = type;
        return this;
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
        const textfield = new TextField(this.name, this.label);
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

/**
 * HiddenField
 */
export class HiddenField extends InputNucleus {
    
    constructor(name, label) {
        super(name, label);
        this.type = 'hidden';

        this.createElement();
    }

    createElement() {
       

        // Input
        this.inputElement = document.createElement('input');
        this.inputElement.type = 'hidden';
        this.inputElement.name = this.name;
        this.inputElement.id = this.name;
        this.inputElement.value = this.getValue();
    }

    setId(id) {
        
    }
    setType(type) {
        this.type = type;
        this.inputElement.type = type;
        return this;
    }

    validate() {
        return true;
    }

    getContent() {
        return this.inputElement;
    }

    clone() {
        const hiddenfield = new HiddenField(this.name, this.label);
        hiddenfield.setType(this.type);
        hiddenfield.setValue(this.value);
        return hiddenfield;
    }
}

export class DateField extends TextField {
    constructor(name, label) {
        super(name, label);
    }
    
    setValue(value, noCallback = false) {
        if (!value) {
            value = '';
        }

        const dateValue = new Date(value);
        if (dateValue instanceof Date && !isNaN(dateValue.getTime())) {
            const yyyy = dateValue.getFullYear();
            const mm = String(dateValue.getMonth() + 1).padStart(2, "0");
            const dd = String(dateValue.getDate()).padStart(2, "0");
            value = `${yyyy}-${mm}-${dd}`;
        }
        
        super.setValue(value, noCallback);
        return this;
    }
}

export class ValutaField extends TextField {
    constructor(name, label) {
        super(name, label);

        this.inputElement.addEventListener("keypress", (e) => {
            if (!/[0-9,]/.test(e.key)) {
                e.preventDefault(); 
            }
        });
    }

    setValue(value, noCallback = false) {
        // Format the value as currency
        super.setValue(this.formatCurrency(value), noCallback);
        return this;
    }

    formatCurrency(value) {
        if (value === null || value === undefined || value === '')
            return '';
        // Zorg dat het een float is en altijd twee decimalen toont
        value = parseFloat(value.replace(',', '.')).toFixed(2)
        if (isNaN(value)) {
            return '';
        }
        return value.replace('.', ',');
    }
}

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
        this.content = document.createElement('div');
        this.content.className = 'mb-2 row';

        // Label
        this.labelElement = document.createElement('label');
        this.labelElement.className = 'col-sm-4 col-form-label';
        this.labelElement.htmlFor = this.name;
        this.labelElement.textContent = this.label;

        // Input wrapper
        const inputWrapper = document.createElement('div');
        inputWrapper.className = 'col-sm-8';

        // Input
        this.inputElement = document.createElement('textarea');
        this.inputElement.className = 'form-control';
        this.inputElement.name = this.name;
        this.inputElement.id = this.name;
        
        this.inputElement.value = this.getValue();
        
        this.feedbackElement = document.createElement('div');
        this.feedbackElement.className = 'invalid-feedback';

        this.inputElement.addEventListener('change', (e) => {
            this.setValue(e.target.value);
        });

        inputWrapper.appendChild(this.inputElement);
        inputWrapper.appendChild(this.feedbackElement);
        this.content.appendChild(this.labelElement);
        this.content.appendChild(inputWrapper);
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

/**
 * Selectbox
 */
export class SelectField extends InputNucleus {
    changeColor = false;

    constructor(name, label, classes) {
        super(name, label);
        this.type = 'text';
        this.classes = classes;
        this.createElement();
    }

    createElement() {
        this.content = document.createElement('div');
        this.content.className = 'mb-2 row ' + (!this.classes ? '' : this.classes);

        // Label
        this.labelElement = document.createElement('label');
        this.labelElement.className = 'col-sm-4 col-form-label';
        this.labelElement.htmlFor = this.name;
        this.labelElement.textContent = this.label;

        // Input wrapper
        const inputWrapper = document.createElement('div');
        inputWrapper.className = 'col-sm-8';

        // Input
        this.inputElement = document.createElement('select');
        this.inputElement.className = 'form-select';
        this.inputElement.name = this.name;
        this.inputElement.id = this.name;
        this.inputElement.placeholder = this.placeholder;

        this.feedbackElement = document.createElement('div');
        this.feedbackElement.className = 'invalid-feedback';

        if (this.classes && this.classes.includes('select-color')) {
            this.changeColor = true;
        }

        this.inputElement.onchange = (e) => { this.onChange(e) };

        inputWrapper.appendChild(this.inputElement);
        inputWrapper.appendChild(this.feedbackElement);
        this.content.appendChild(this.labelElement);
        this.content.appendChild(inputWrapper);
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
        option.textContent = placeholder;
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
        if (this.callback) {
            this.callback(this.name, this.value);
        }

        if (this.changeColor) {
            switch(this.inputElement.value) {
                case '1':
                    this.inputElement.style.setProperty("background-color", "#45b667ff", "important");
                    break;
                case '2':
                    this.inputElement.style.setProperty("background-color", "#ec931eff", "important");
                    break;
                case '3':
                    this.inputElement.style.setProperty("background-color", "#ff3366", "important");
                    break;
                default:
                    this.inputElement.style.setProperty("background-color", "");
                    break;

            }
        }
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
        selectField.changeColor = this.changeColor;
        selectField.data = this.data;
        selectField.setValue(this.value);
        return selectField;
    }
}

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
        this.content = document.createElement('div');
        this.content.className = 'mb-2 row field-wrapper' + (this.classes ? ' ' + this.classes : '');

        // Label
        this.labelElement = document.createElement('label');
        this.labelElement.className = 'col-sm-4 col-form-label';
        this.labelElement.htmlFor = this.name;
        this.labelElement.textContent = this.label;

        // Input wrapper
        const inputWrapper = document.createElement('div');
        inputWrapper.className = 'col-sm-8';

        this.inputElement = document.createElement('div');
        this.inputElement.className = 'radio-input-wrapper';

        this.feedbackElement = document.createElement('div');
        this.feedbackElement.className = 'invalid-feedback';

        inputWrapper.appendChild(this.inputElement);
        inputWrapper.appendChild(this.feedbackElement);
        this.content.appendChild(this.labelElement);
        this.content.appendChild(inputWrapper);
    }

    setReadonly(readonly) {
        if (!Auth.inRoles(['ROLE_WRITE', 'ROLE_ADMIN'])) {
            readonly = true;
        }
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
        
        if (!noCallback && this.callback) {
            this.callback(this.name, this.value);
        }

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

        if (!noCallback && this.callback) {
            this.callback(this.name, this.value);
        }
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
        this.content = document.createElement('div');
        this.content.className = 'mb-2 row field-wrapper' + (this.classes ? ' ' + this.classes : '');

        // Label
        this.labelElement = document.createElement('label');
        this.labelElement.className = 'col-sm-4 col-form-label';
        this.labelElement.htmlFor = this.name;
        this.labelElement.textContent = this.label;

        // Input wrapper
        const inputWrapper = document.createElement('div');
        inputWrapper.className = 'col-sm-8';

        this.inputElement = document.createElement('div');
        this.inputElement.className = 'checkbox-input-wrapper';

        this.feedbackElement = document.createElement('div');
        this.feedbackElement.className = 'invalid-feedback';

        inputWrapper.appendChild(this.inputElement);
        inputWrapper.appendChild(this.feedbackElement);
        this.content.appendChild(this.labelElement);
        this.content.appendChild(inputWrapper);
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

        if (!noCallback && this.callback) {
            this.callback(this.name, this.values);
        }
        
        // this.value = value;

        return this;
    }

    removeInputValue(opt, noCallback = false) {
        const index = this.values.findIndex(o => o.value === opt.value);
        if (index == -1) 
            return this;

        this.values.splice(index, 1);

        if (!noCallback && this.callback) {
            this.callback(this.name, this.values);
        }

        return this;
    }

    /**
     * 
     */
    setValue(values, noCallback = false) {
        if (!values) {
            return this;
        }
        this.inputElements.forEach(input => {
            
            if (input.checkbox.value == values.value) {
                input.checkbox.checked = true;
                this.values.push(values);
            }
        });

        if (!noCallback && this.callback) {
            this.callback(this.name, this.value);
        }
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
    }

     validate(valid = true, message = '') {
        this.errors = [];
        this.inputElement.classList.remove('is-valid', 'is-invalid');
            if (this.required && (!this.getOptions() || this.getOptions().length === 0  )) {
            this.errors.push('Dit veld is verplicht.');
            valid = false;
        }

        this.setvalidationState(valid);
        

        return valid;
    }

    setReadonly(readonly) {
        if (!Auth.inRoles(['ROLE_WRITE', 'ROLE_ADMIN'])) {
            readonly = true;
        }
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