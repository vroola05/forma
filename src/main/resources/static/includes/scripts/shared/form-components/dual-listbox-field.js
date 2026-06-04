import { InputLayout, InputNucleus } from './interface/input-base.js';
import { FormButton } from './components/form-button.js';

/**
 * Dual Listbox
 */
export class DualListboxField extends InputNucleus {
    values = [];

    constructor(name, label, classes) {
        super(name, label);
        this.type = 'dual-listbox';
        this.classes = classes;
        this.createElement();
    }

    createElement() {
        const inputInnerWrapper = document.createElement('div');
        inputInnerWrapper.className = 'dual-listbox-wrapper';
        this.createInput(inputInnerWrapper);

        this.inputElementDeselected = this.#createSelect(inputInnerWrapper,'deselected', this.inputElement);
        inputInnerWrapper.appendChild(this.#createBtns());
        this.inputElement = this.#createSelect(inputInnerWrapper,'selected', this.inputElementDeselected);

        this.inputElementDeselected.addEventListener('change', (e) => this.inputElement.selectedIndex = -1);
        this.inputElement.addEventListener('change', (e) => this.inputElementDeselected.selectedIndex = -1);
    }

    #createSelect(container, identifier, otherElement) {

        const dualListboxDeselectedContainer = document.createElement('div');
        dualListboxDeselectedContainer.className = 'dual-listbox-container';

        const element = document.createElement('select');
        element.className = 'form-select dual-listbox';
        element.name = `${this.name}-${identifier}`;
        element.id = `${this.name}-${identifier}`;
        element.multiple = true;

        dualListboxDeselectedContainer.appendChild(element);
        container.appendChild(dualListboxDeselectedContainer);
        return element;
    }

    #createBtns() {
        const dualListboxBtnContainer = document.createElement('div');
        dualListboxBtnContainer.className = 'dual-listbox-btn-container';

        const btnMoveToRight = new FormButton('>', 'btn btn-primary dual-listbox-btn', null, () => {
            const selectedOptions = Array.from(this.inputElementDeselected.selectedOptions);
            this.#selectOptions(selectedOptions);
        });

        const btnMoveToLeft = new FormButton('<', 'btn btn-primary dual-listbox-btn', null, () => {
            const selectedOptions = Array.from(this.inputElement.selectedOptions);
            this.#deselectOptions(selectedOptions);
        });

        const btnMoveAllToRight = new FormButton('>>', 'btn btn-primary dual-listbox-btn', null, () => {
            const selectedOptions = Array.from(this.inputElementDeselected.options);
            this.#selectOptions(selectedOptions);
        });
        const btnMoveAllToLeft = new FormButton('<<', 'btn btn-primary dual-listbox-btn', null, () => {
            const selectedOptions = Array.from(this.inputElement.options);
            this.#deselectOptions(selectedOptions);
        });

        dualListboxBtnContainer.append(
            btnMoveToRight.getContent(),
            btnMoveToLeft.getContent(),
            btnMoveAllToRight.getContent(),
            btnMoveAllToLeft.getContent()
        );
        return dualListboxBtnContainer;
    }

    #deselectOptions(selectedOptions) {
        this.inputElementDeselected.append(...selectedOptions);
        
        this.#orderList(this.inputElementDeselected);

        this.#setSelectedValues();
    }

    #selectOptions(selectedOptions) {
        this.inputElement.append(...selectedOptions);

        this.#orderList(this.inputElement);

        this.#setSelectedValues();
    }

    addOption(value, text) {
        if (!this.inputElementDeselected) {
            throw new Error('Input element is not created yet. Call createElement() first.');
        }
        
        const option = document.createElement('option');
        option.value = value;
        option.textContent = text;
        this.inputElementDeselected.appendChild(option);

        return this;
    }

    addOptions(options) {
        if (!options)
            return this;

        if (!this.inputElementDeselected) {
            throw new Error('Input element is not created yet. Call createElement() first.');
        }

        options.forEach(option => {
            this.addOption(option.value, option.text);
        });

        this.#orderList(this.inputElementDeselected);

        return this;
    }

    #orderList(element) {
        const sortedChildren = Array.from(element.children)
            .sort((a, b) => a.textContent.localeCompare(b.textContent));

        element.append(...sortedChildren);
    }

    getOptions() {
        return this.values;
    }

    setValue(options, noCallback = false) {
        if (!options || !Array.isArray(options)) {
            return this;
        }

        this.inputElementDeselected.append(...this.inputElement.options);
        this.inputElement.options.length = 0;

        const optionsToSelect = [];

        options.forEach(val => {
            const option = Array.from(this.inputElementDeselected.options).find(opt => opt.value === val.value);
            if (option) {
                optionsToSelect.push(option);
            }
        });

        this.inputElement.append(...optionsToSelect);

        this.#orderList(this.inputElement);

        this.#setSelectedValues();

        return this;
    }

    #setSelectedValues(noCallback = false) {
        this.values = Array.from(this.inputElement.options).map(option => ({ value: option.value, text: option.text }));

        this.valueChanged(noCallback, this.values);
    }

    setReadonly(readonly) {
        if (readonly === undefined) {
            readonly = false;
        }

        this.readonly = readonly;
        this.inputElement.disabled = readonly;
        this.inputElementDeselected.disabled = readonly;
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

    clone() {
        const dualListboxField = new DualListboxField(this.name, this.label, this.classes);
        [...this.inputElement.options].forEach(option => {
            const clone = option.cloneNode(true)
            clone.selected = option.selected;
            dualListboxField.inputElement.add(clone);
        });

        [...this.inputElementDeselected.options].forEach(option => {
            const clone = option.cloneNode(true)
            clone.selected = option.selected;
            dualListboxField.inputElementDeselected.add(clone);
        });

        dualListboxField.setClasses(this.classes);
        dualListboxField.required = this.required;
        dualListboxField.setReadonly(this.readonly);
        dualListboxField.minLength = this.minLength;
        dualListboxField.maxLength = this.maxLength;
        dualListboxField.validators = this.validators;
        dualListboxField.data = this.data;
        dualListboxField.setValue(this.values);
        return dualListboxField;
    }
}
