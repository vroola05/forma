import { InputNucleus } from '../../../shared/form-components/interface/input-base.js';
import { BuilderFormService } from '../../services/builder-form-service.js';

/**
 * Textfield
 */
export class BuilderConditionsAutocompleteField extends InputNucleus {
    minLength = undefined;
    maxLength = undefined;

    isAutocompleteVisible = false;
    cancelBlur = false;
    hasFocus = false;
    selectedAutocompleteIndex = -1;

    constructor(name, label) {
        super(name, label);
        this.type = 'text';

        this.createElement();
    }

    createElement() {
        const inputElementContainer = document.createElement('div');
        inputElementContainer.className = 'input-element-container';

        const autoCompleteMenuIcon = document.createElement('div');
        autoCompleteMenuIcon.className = 'autocomplete-input-btn';
        autoCompleteMenuIcon.innerHTML = '$';
        inputElementContainer.appendChild(autoCompleteMenuIcon);
        autoCompleteMenuIcon.addEventListener('click', () => {
            this.toggle();
        });

        this.inputElement = document.createElement('input');
        this.inputElement.className = 'form-control autocomplete-input';
        this.inputElement.name = this.name;
        this.inputElement.id = this.name;
        this.inputElement.value = this.getValue();
        inputElementContainer.appendChild(this.inputElement);

        this.createInput(inputElementContainer);

        this.inputWrapper.classList.add('builder-autocomplete-wrapper')

        this.autocompleteMenuElement = document.createElement('div');
        this.autocompleteMenuElement.className = 'autocomplete-menu hidden';
        this.inputWrapper.appendChild(this.autocompleteMenuElement)

        this.setInputFocusListener();
        this.setInputInputListener();
        this.setInputKeyDownListener();
        this.setInputBlurListener();
        this.setInputChangeListener();
        
    }

    /**
     * Select the autocomplete menu item at the given index and add the 'selected' class to it, while removing the 'selected' class from the previously selected item
     * @param {number} index 
     */
    selectAutocompleteMenuItem(index) {
        this.autocompleteMenuElement.children[this.selectedAutocompleteIndex]?.classList.remove('selected');
        this.selectedAutocompleteIndex = index;
        if (this.selectedAutocompleteIndex >= 0 && this.selectedAutocompleteIndex < this.autocompleteMenuElement.children.length) {
            this.autocompleteMenuElement.children[this.selectedAutocompleteIndex].classList.add('selected');
        }
    }

    toggle() {
        if (this.hasFocus == true) {
            this.cancelBlur = true;
        }
        if (this.autocompleteMenuElement.classList.contains('hidden')) {
            this.searchPath(this.inputElement.value);
            this.focus();
        } else {
            this.showAutocompleteMenu(false);
        }
        return this;
    }

    showAutocompleteMenu(show) {
        const isHidden = this.autocompleteMenuElement.classList.contains('hidden');
        if (show && isHidden) {
            this.isAutocompleteVisible = true;
            this.selectedAutocompleteIndex = -1;
            this.autocompleteMenuElement.classList.remove('hidden');
        } else if (!show && !isHidden) {
            this.isAutocompleteVisible = false;
            this.autocompleteMenuElement.classList.add('hidden');
        }
    }

    createAutocompleteMenuItems(fields, prefix) {
        this.autocompleteMenuElement.innerHTML = '';

        fields.forEach(field => {
            const name = field.fieldProperties.getPropertyById('name').value;
            const matchName = name.slice(0, prefix.length);
            const restName = name.slice(prefix.length); 

            const item = document.createElement('div');
            item.className = 'autocomplete-menu-item';
            item.dataset.value = name;
            item.innerHTML = `<span class="match">${matchName}</span>${restName}`;
            this.autocompleteMenuElement.appendChild(item);
            item.addEventListener('click', () => {
                this.cancelBlur = true;

                const tokens = this.getValueAsArray();
                if (tokens.length === 0) {
                    return;
                }

                const fields = this.getCurrentBuilderFields(tokens);
                if (!fields) {
                    return;
                }

                tokens[tokens.length - 1] = field.fieldProperties.getPropertyById('name').value;

                if (field.builderChildFields && field.builderChildFields.length > 0) {
                    tokens.push('');
                
                    const value = tokens.join('.');
                    this.setValue(value);
                    
                    this.focus();
                    this.searchPath(value);
                    if (this.onListItemClickedListener) {
                        this.onListItemClickedListener(this.getValue());
                    }
                } else {
                    const value = tokens.join('.');
                    this.setValue(value);
                    this.showAutocompleteMenu(false);
                    if (this.onFieldFoundListener) {
                        this.onFieldFoundListener(this.getValue());
                    }
                }
            });
        });
    }

    focus() {
        this.inputElement.focus();
        const lengte = this.inputElement.value.length;
        this.inputElement.setSelectionRange(lengte, lengte);
    }

    searchPath(value) {
        this.autocompleteMenuElement.innerHTML = '';

        this.showAutocompleteMenu(true);
        const tokens = this.getValueAsArray();
        
        const fields = this.getCurrentBuilderFields(tokens);
        if (!fields) {
            this.autocompleteMenuElement.innerHTML = '<div class="autocomplete-menu-item">Geen velden gevonden</div>';
            return;
        }
        this.createAutocompleteMenuItems(fields, tokens[tokens.length - 1]);
    }

    getValueAsArray() {
        let value = this.inputElement.value;
        if (!value || value === '') {
            value += '$.';
        } else if (value === '$') {
            value += '.';
        }
        
        return value.split('.');
    }

    getCurrentBuilderFields(tokens) {
        let fields = [BuilderFormService.getBuilderForm()];
        for (let i = 1; i < tokens.length; i++) {
            if (i >= tokens.length - 1) {
                return this.getFields(fields, tokens[i]);
            }

            const field = this.getField(fields, tokens[i]);
            if (!field) {
                console.warn('Field not found for token:', tokens[i]);
                return undefined;
            }

            fields = field.builderChildFields || [];
            if (fields.length === 0) {
                console.warn('No builder fields found for field:', field);
                return undefined;
            }
        }
        return [];
    }

    getField(fields, name) {
        return fields.find(field => field.fieldProperties.getPropertyById('name').value === name);
    }

    getFields(fields, name) {
        return fields.filter(field => field.fieldProperties.getPropertyById('name').value.startsWith(name));
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
        if (!this.getShow()) {
            return true;
        }
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

        this.setValidationState(valid);
        return valid;
    }

    setOnListItemClickedListener(listener) {
        this.onListItemClickedListener = listener;
        return this;
    }
    
    setOnFieldFoundListener(listener) {
        this.onFieldFoundListener = listener;
        return this;
    }

    /**
     * Check if the input value starts with '$', if not hide the autocomplete menu, otherwise search for matching fields and show the autocomplete menu
     */
    setInputInputListener() {
        this.inputElement.addEventListener('input', (e) => {
            if (!e.target.value.startsWith('$')) {
                this.showAutocompleteMenu(false);
                return;
            }
            this.searchPath(e.target.value);
        });
    }

    /**
     * Set hasFocus to true when the input element is focused
     */
    setInputFocusListener() {
        this.inputElement.addEventListener('focus', (e) => {
            this.hasFocus = true;
        });
    }

    /**
     * Set hasFocus to false when the input element is blurred, but only after a short delay to allow click events on the autocomplete menu to be registered. If cancelBlur is true, do not set hasFocus to false and reset cancelBlur to false.
     */
    setInputBlurListener() {
        this.inputElement.addEventListener('blur', () => {
            setTimeout(() => {
                this.hasFocus = false;
                if (this.cancelBlur) {
                    this.cancelBlur = false;
                    return;
                }
                this.showAutocompleteMenu(false);
            }, 200); 
        });
    }

    /**
     * Set the value of the input element when the value changes
     */
    setInputChangeListener() {
        this.inputElement.addEventListener('change', (e) => {
            this.setValue(e.target.value);
        });
    }

    /**
     * Set keydown listener on the input element to navigate through the autocomplete menu with the arrow keys and select an item with enter or tab
     */
    setInputKeyDownListener() {
        this.inputElement.addEventListener('keydown', (e) => {
            if (!this.isAutocompleteVisible) {
                return;
            }
            
            switch (e.key) {
                case 'ArrowUp':
                    e.preventDefault();
                    this.selectAutocompleteMenuItem(
                        this.selectedAutocompleteIndex > 0 ? this.selectedAutocompleteIndex - 1 : this.autocompleteMenuElement.children.length - 1);
                    
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    this.selectAutocompleteMenuItem(
                            this.selectedAutocompleteIndex < this.autocompleteMenuElement.children.length - 1 ? this.selectedAutocompleteIndex + 1 : 0);
                    break;
                case 'ArrowLeft':
                    break;
                case 'Tab':
                    e.preventDefault();
                    if (this.selectedAutocompleteIndex >= 0 && this.selectedAutocompleteIndex < this.autocompleteMenuElement.children.length) {
                        this.autocompleteMenuElement.children[this.selectedAutocompleteIndex].click();
                    }
                    this.selectedAutocompleteIndex = -1;
                case 'Enter':
                    e.preventDefault();
                    if (this.selectedAutocompleteIndex >= 0 && this.selectedAutocompleteIndex < this.autocompleteMenuElement.children.length) {
                        this.autocompleteMenuElement.children[this.selectedAutocompleteIndex].click();
                    }
                    this.selectedAutocompleteIndex = -1;
            }
        });
    }
}