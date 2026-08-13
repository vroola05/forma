import { OptionDto } from '../model/types';
import { InputNucleus } from './interface/input-base';

/**
 * Radiobox
 */
export class RadioField extends InputNucleus {
    id: string | undefined = undefined;

    inputElements: { radio: HTMLInputElement; label: HTMLLabelElement }[] = [];

    constructor(name: string, label: string | undefined, classes: string, id: string | undefined = undefined) {
        super(document.createElement('div'), name, label, id);
        
        this.classes = classes;

        this.createElement();
    }

    /**
     * 
     */
    createElement() {
        this.inputElement.className = 'radio-input-wrapper';
        this.createInput(this.inputElement);
    }

    setReadonly(readonly: boolean | undefined = undefined) {
        if (readonly === undefined) {
            readonly = false;
        }
        this.readonly = readonly;

        [...this.inputElements].forEach(inputElement => {
            inputElement.radio.readOnly = readonly;
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
    addOption(value: string, text: string, checked: boolean = false) {
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
            const radioInputField = (e.target as HTMLElement).closest('.radio-input-field') as HTMLInputElement;
            this.setInputValue([{ value: radioInputField.value, text: radioInputField.dataset.text }]);
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
            this.setValue([{value, text}]);
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
     * Deze functie is gekoppeld aan de input change event van de radio input.
     */
    setInputValue(value: any, noCallback = false) {
        this.value = value;
        this.valueChanged(noCallback);

        return this;
    }

    setValue(value: OptionDto[] | undefined, noCallback = false, fromUi = false) {
        
        const isEmpty = !value || (Array.isArray(value) && value.length === 0);

        if (isEmpty) {
            this.value = '';
            this.inputElements.forEach(input => input.radio.checked = false);
        } else {
            const targetValue = typeof value === 'string' ? value : value[0]?.value;
            let found = false;

            this.inputElements.forEach(input => {
                const isMatch = input.radio.value == targetValue;
                input.radio.checked = isMatch;
                
                if (isMatch) {
                    this.value = [{ value: targetValue, text: input.radio.dataset.text }];
                    found = true;
                }
            });

            // Als de string-waarde niet bestond in de opties: stop direct (zoals in je origineel)
            if (typeof value === 'string' && !found) {
                return this;
            }
        }

        this.valueChanged(noCallback);
        return this;
    }

    /**
     * 
     * @returns 
     */
    getOptions(): OptionDto[] {
        return this.value ? this.value : [];
    }

    /**
     * 
     * @returns 
     */
    clone() {
        const radioField = new RadioField(this.name, this.label, this.classes, this.id);

        [...this.inputElements].forEach(inputElement => {
            const radioElement = inputElement.radio as HTMLElement;
            radioField.addOption(inputElement.radio.value, radioElement?.dataset?.text ?? '', inputElement.radio.checked);
        });

        radioField.setClasses(this.classes);
        radioField.value = this.value;
        radioField.required = this.required;
        radioField.validators = this.validators;
        return radioField;
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
    setId(id: string | undefined) {
        this.id = id;
        if (!id) {
            return this;
        }
        for (let i = 0; i < this.inputElements.length; i++) {

            const newId = this.createInputId(i);
            this.inputElements[i].radio.id = newId;
            this.inputElements[i].radio.name = id;
            this.inputElements[i].label.htmlFor = newId;
        }
        return this;
    }
}
