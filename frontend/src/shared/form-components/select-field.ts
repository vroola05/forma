import { OptionDto, TranslationDto } from '../model/types';
import { InputNucleus } from './interface/input-base';

/**
 * Selectbox
 */
export class SelectField extends InputNucleus<HTMLSelectElement> {
    value: OptionDto[];

    constructor(name: string, labels: TranslationDto[] | undefined, classes: string, id: string | undefined = undefined) {
        super(document.createElement('select'), name, labels, id);
        
        this.value = [];
        this.classes = classes;
        this.createElement();
    }

    createElement() {
        this.inputElement.className = 'form-select';
        this.inputElement.name = this.name;
        this.inputElement.id = this.getId();

        this.inputElement.onchange = (e) => { this.onChange(e) };
        
        this.createInput(this.inputElement);
    }

    onChange(e: Event) {
        if (this.readonly) {
            return false;
        }

        const target =(e.target as HTMLSelectElement);
        const selectedOption = target.options[target.selectedIndex];
        this.setValue([{ value: target.value, text: selectedOption.text }]);
    }

    addOption(value: string, text: string) {
        if (!this.inputElement) {
            throw new Error('Input element is not created yet. Call createElement() first.');
        }
        
        const option = document.createElement('option');
        option.value = value;
        option.textContent = text;
        this.inputElement.appendChild(option);
        return this;
    }

    addOptions(options: OptionDto[] | undefined) {
        if (!options)
            return this;

        if (!this.inputElement) {
            throw new Error('Input element is not created yet. Call createElement() first.');
        }
        options.forEach(option => {
            this.addOption(option.value, option.text);
        });

        return this;
    }

    setPlaceholder(placeholder: string) {
        const option = document.createElement('option');
        option.textContent = placeholder ?? '';
        option.disabled = true;
        option.selected = true;

        this.inputElement.insertBefore(option, this.inputElement.firstChild);

        return this;
    }

    getOptions(): OptionDto[] {
        return this.value ? this.value : [];
    }

    setValue(value: OptionDto[] | undefined, noCallback = false) {
        requestAnimationFrame(() => {
            const isEmpty = value === undefined  || (Array.isArray(value) && value.length === 0);
            if (isEmpty) {
                this.value = [];
                this.inputElement.selectedIndex = -1;
            } else {
                this.inputElement.value = value[0]?.value ?? '';
                this.value = value;
            }
        
            this.valueChanged(noCallback);
        });
        return this;
    }

    clone() {
        const selectField = new SelectField(this.name, this.labels, this.classes, this.id);
        [...this.inputElement.options].forEach(option => {
            const clone = option.cloneNode(true) as HTMLOptionElement
            clone.selected = option.selected;
            selectField.inputElement.add(clone);
        });

        
        selectField.setClasses(this.classes);
        selectField.required = this.required;
        selectField.setReadonly(this.readonly);
        selectField.validators = this.validators;
        selectField.setValue(this.value);
        return selectField;
    }
}
