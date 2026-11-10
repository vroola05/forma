import { BuilderFieldInterface } from '../../form-builder/fields/builder-field-interface';
import { BuilderFormService, BuilderFormServiceRegistry } from '../../form-builder/services/builder-form-service';
import { FIELD_TYPE } from '../../form-builder/types';
import { OptionDto, TokenType, TranslationDto, WordContext } from '../model/types';
import { VariableService } from '../services/variable-service';
import { InputNucleus } from './interface/input-base';



/**
 * Textfield
 */
export class ConditionsAutocompleteField extends InputNucleus<HTMLInputElement> {
    autocompleteMenuElement = document.createElement('div');
    minLength: number | undefined = undefined;
    maxLength: number | undefined = undefined;

    isAutocompleteVisible: boolean = false;
    cancelBlur: boolean = false;
    hasFocus: boolean = false;
    selectedAutocompleteIndex: number = -1;

    tokenTypes: OptionDto[] = [
        { value:'FORM_VALUE', text: 'Formulier veld' },
        { value:'PAGE_VAR', text: 'Formulier variabele' },
    ];

    #builderFormService: BuilderFormService;

    onListItemClickedListener: ((value: any) => void) | null = null;
    onFieldFoundListener: ((value: any) => void) | null = null;
    currentCursorPostion: number = -1;

    constructor(name: string, labels: TranslationDto[] | undefined = undefined) {
        super(document.createElement('input'), name, labels);
        this.type = 'conditions-autocomplete';

        this.#builderFormService = BuilderFormServiceRegistry.get('builder-form');
        const inputElementContainer = document.createElement('div');
        inputElementContainer.className = 'input-element-container';

        const autoCompleteMenuIcon = document.createElement('div');
        autoCompleteMenuIcon.className = 'autocomplete-input-btn';
        autoCompleteMenuIcon.innerHTML = '{}';
        inputElementContainer.appendChild(autoCompleteMenuIcon);
        autoCompleteMenuIcon.addEventListener('click', (e) => {
            this.toggle();
        });

        

        this.inputElement = document.createElement('input') as HTMLInputElement;
        this.inputElement.className = 'form-control autocomplete-input';
        this.inputElement.name = this.name;
        this.inputElement.id = this.name;
        this.inputElement.value = this.getValue();
        inputElementContainer.appendChild(this.inputElement);

        this.createInput(inputElementContainer);

        this.inputWrapper.classList.add('builder-autocomplete-wrapper')

        this.autocompleteMenuElement.className = 'autocomplete-menu hidden';
        this.inputWrapper.appendChild(this.autocompleteMenuElement)

        this.setInputFocusListener();
        this.setInputInputListener();
        this.setInputKeyDownListener();
        this.setInputBlurListener();
        this.setInputChangeListener();

    }

    external() {
        this.currentCursorPostion = -2;
        return this;
    }

    focus(index: number = -1) {
        this.inputElement.focus();
        const position = index >= 0 ? index : this.inputElement.value.length
        this.inputElement.setSelectionRange(position, position);
    }

    toggle() {
        const wordContext = this.getWordAtCursor(this.inputElement);

        if (this.currentCursorPostion === -1 || this.currentCursorPostion === wordContext.endIndex) {
            if (wordContext.type === 'TEXT' || wordContext.isComplete) {
                wordContext.startIndex = wordContext.endIndex;
                wordContext.innerWord = '';
                wordContext.word = '';
                wordContext.type = 'TEXT';
            }
        }

        if (wordContext.type === 'TEXT' && wordContext.word !== '') {
            this.showAutocompleteMenu(false);
            return this;
        }

        const tokens = wordContext.innerWord.split('.');
        const menuItems = this.getMenuItems(wordContext, tokens);

        this.createMenuItems(wordContext, menuItems);
        this.showAutocompleteMenu(true);
        return this;
    }

    setType(type: FIELD_TYPE) {
        this.type = type;
        this.inputElement.type = type;
        return this;
    }

    setMinLength(length: number | undefined, message = 'Minimale lengte is ' + length) {
        if (!length) {
            this.minLength = undefined;
            this.inputElement.removeAttribute('minLength');
        } else {
            this.minLength = length;
            this.inputElement.minLength = length;
        }
        return this;
    }

    setMaxLength(length: number | undefined , message = 'Maximale lengte is ' + length) {
        if (!length) {
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
            if (this.maxLength && this.maxLength !== null && this.getValue().length > this.maxLength) {
                this.errors.push(`Maximaal ${this.maxLength} tekens toegestaan.`);
                valid = false;
            }
        }

        this.setValidationState(valid);
        return valid;
    }

    setOnListItemClickedListener(listener: ((value: any) => void) | null) {
        this.onListItemClickedListener = listener;
        return this;
    }
    
    setOnFieldFoundListener(listener: ((value: any) => void) | null) {
        this.onFieldFoundListener = listener;
        return this;
    }

    /**
     * Check if the input value starts with '$', if not hide the autocomplete menu, 
     * otherwise search for matching fields and show the autocomplete menu
     */
    setInputInputListener() {
        this.inputElement.addEventListener('input', (e) => {
            const inputEvent = e as InputEvent;
            const target = inputEvent.target as HTMLInputElement;

            if (!target) {
                this.showAutocompleteMenu(false);
                return null;
            }
            this.saveCursor(e);
            
            const wordContext = this.getWordAtCursor(target);
            if (wordContext.type === 'TEXT') {
                this.showAutocompleteMenu(false);
                return;
            }

            const tokens = wordContext.innerWord.split('.');
            const menuItems = this.getMenuItems(wordContext, tokens);

            this.createMenuItems(wordContext, menuItems);
            this.showAutocompleteMenu(true);
        });
    }

    getMenuItems(wordContext: WordContext, tokens: string []) {
        let menuItems: OptionDto[];
        if (wordContext.type === 'FORM_VALUE') {
            menuItems = this.getCurrentFieldNames(tokens);
        } else if (wordContext.type === 'PAGE_VAR') {
            menuItems = this.getCurrentVariableNames(tokens)
        } else {
            menuItems = this.getStartMenuNames();
        }

        if (menuItems.length === 0) {
            this.showAutocompleteMenu(false);
            return [];
        }
        return menuItems;
    }

    getWordAtCursor(target: HTMLInputElement | HTMLTextAreaElement): WordContext {
        const text = target.value;
        const cursorIndex = target.selectionStart ?? 0;

        let start = cursorIndex;

        while (start > 0) {
            const prevChar = text.charAt(start - 1);
            
            if (/\s/.test(prevChar)) break;
            
            if (prevChar === '}' && start !== cursorIndex) break;
            
            start--;
            
            
            const currentChar = text.charAt(start);
            if (currentChar === '$' || currentChar === '#') {
                break;
            }
        }

        let end = cursorIndex;
        while (end < text.length) {
            const nextChar = text.charAt(end);

            if (/\s/.test(nextChar)) break;
            
            if ((nextChar === '$' || nextChar === '#') && end !== cursorIndex) break;

            end++;

            if (text.charAt(end - 1) === '}') {
                break;
            }
        }

        const word = text.substring(start, end);

        let type: TokenType = 'TEXT';
        let isComplete = false;

        if (word.startsWith('${') || word === '$') {
            type = 'FORM_VALUE';
            isComplete = word.startsWith('${') && word.endsWith('}');
        } else if (word.startsWith('#{') || word === '#') {
            type = 'PAGE_VAR';
            isComplete = word.startsWith('#{') && word.endsWith('}');
        }

        let innerWord;
        if (type !== 'TEXT') {
            const prefixLength = word.includes('{') ? 2 : 1;
            const suffixLength = word.endsWith('}') ? 1 : 0;

            innerWord = word.substring(prefixLength, word.length - suffixLength);
        } else {
            innerWord = word;
        }

        return {
            word,
            innerWord,
            startIndex: start,
            endIndex: end,
            type,
            isComplete
        };
    }

    createMenuItems(wordContext: WordContext, menuItems: OptionDto[]) {
        this.autocompleteMenuElement.innerHTML = '';

        for (const tokenType of menuItems) {
            const item = document.createElement('div');
            item.className = 'autocomplete-menu-item';
            item.dataset.value = tokenType.value;
            item.innerHTML = `<span class="match">${tokenType.text}</span>`;
            item.addEventListener('click', (e) => {
                e.preventDefault();


                let tokens;
                if (this.tokenTypes.find(a => a.value === item.dataset.value)) {
                    wordContext.type = item.dataset.value as TokenType;
                    tokens = [];
                    tokens.push('');
                } else {
                    wordContext.innerWord = item.dataset.value?? '';

                    tokens = wordContext.innerWord.split('.');
                    tokens.push('');
                }

                const menuItems = this.getMenuItems(wordContext, tokens);
                if (menuItems.length > 0) {

                    this.createMenuItems(wordContext, menuItems);
                    this.showAutocompleteMenu(true);

                    if (this.onListItemClickedListener) {
                        this.onListItemClickedListener(this.getValue());
                    }
                } else {
                    this.showAutocompleteMenu(false);

                    let completedTag;
                    if (wordContext.type === 'FORM_VALUE') {
                        completedTag = `\${${wordContext.innerWord}}`;
                    } else if (wordContext.type === 'PAGE_VAR') {
                        completedTag = `#{${wordContext.innerWord}}`;
                    } else {
                        completedTag = wordContext.innerWord;
                    }

                    if (!wordContext.startIndex) {
                        wordContext.startIndex = 0;
                    }
                    if (!wordContext.endIndex) {
                        wordContext.endIndex = 0;
                    }
                    const value = this.getValue() as string;

                    this.setValue(value.substring(0, wordContext.startIndex) + 
                        completedTag + 
                        value.substring(wordContext.endIndex));

                    this.cancelBlur = true;
                    
                    this.focus(wordContext.startIndex + completedTag.length);

                    if (this.onFieldFoundListener) {
                        this.onFieldFoundListener(completedTag);
                    }
                    
                }
            });
            this.autocompleteMenuElement.appendChild(item);
        }
    }
    
    getStartMenuNames(): OptionDto[] {
        return this.tokenTypes;
    }

    getCurrentFieldNames(tokens: string[]): OptionDto[] {
        const form = this.#builderFormService.getBuilderForm();
        if (!form) {
            return [];
        }

        let fields: BuilderFieldInterface[] = [];
        fields.push(form);
        let prefix = '';
        for (let i = 0; i < tokens.length; i++) {
            if (i >= tokens.length - 1) {
                
                return this.#filterFields(fields, tokens[i], prefix);
            }
            
            const field = this.#getField(fields, tokens[i]);
            if (!field) {
                return [];
            }

            prefix += field.fieldProperties.getPropertyById('name')?.value + '.';

            fields = field.getFields() || [];

            if (fields.length === 0) {
                return [];
            }
        }
        return [];
    }

    #filterFields(fields: BuilderFieldInterface[], name: string, prefix: string): OptionDto[] {
        return fields
                .filter(field => field.fieldProperties.getPropertyById('name')?.value.startsWith(name))
                .map(field => {
                    const value = field.fieldProperties.getPropertyById('name')?.value;

                    return {
                        value: prefix + value,
                        text: value
                    }
                });
    }

    #getField(fields: BuilderFieldInterface[], name: string): BuilderFieldInterface | undefined{
        return fields.find(field => field.fieldProperties.getPropertyById('name')?.value === name);
    }

    getCurrentVariableNames(tokens: string[]): OptionDto[] {
            if (!this.form || tokens === undefined || tokens.length !== 1) {
                return [];
            }
            const variables = VariableService.get(this.form.getId());
            if (!variables) {
                return [];
            }
            
            const token: string = tokens.at(1)?? '';
            return variables
                .filter(variable => variable.name !== undefined && variable.name.startsWith(token))
                .map(variable => {
                    return {
                        value: variable.name,
                        text: variable.name
                    }
                });
        }

    /**
     * Set hasFocus to true when the input element is focused
     */
    setInputFocusListener() {
        this.inputElement.addEventListener('focus', () => {
            this.hasFocus = true;
        });
        this.inputElement.addEventListener('click', (e: Event) => {
            if (!e.target) {
                this.showAutocompleteMenu(false);
                return null;
            }
            
            this.saveCursor(e)
        });
    }

    /**
     * Set hasFocus to false when the input element is blurred,
     * but only after a short delay to allow click events on the autocomplete menu to be registered.
     * If cancelBlur is true, do not set hasFocus to false and reset cancelBlur to false.
     */
    setInputBlurListener() {
        this.inputElement.addEventListener('blur', () => {
            setTimeout(() => {
                this.hasFocus = false;
                if (this.cancelBlur) {
                    this.cancelBlur = false;
                    return;
                }
                this.currentCursorPostion = -1;
            }, 200); 
        });
    }

    /**
     * Set the value of the input element when the value changes
     */
    setInputChangeListener() {
        this.inputElement.addEventListener('change', (e) => {
            const target = e.target as HTMLInputElement;
            this.setValue(target.value);
        });
    }

    /**
     * Set keydown listener on the input element to navigate through the autocomplete menu with the arrow keys and select an item with enter or tab
     */
    setInputKeyDownListener() {
        this.inputElement.addEventListener('keyup', (e) => {
            this.saveCursor(e);
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
                        const selectedChild = this.autocompleteMenuElement.children[this.selectedAutocompleteIndex] as HTMLElement | undefined;
                        if (selectedChild) {
                            selectedChild.click();
                        }
                    }
                    this.selectedAutocompleteIndex = -1;
                    break;
                case 'Enter':
                    e.preventDefault();
                    if (this.selectedAutocompleteIndex >= 0 && this.selectedAutocompleteIndex < this.autocompleteMenuElement.children.length) {
                        const selectedChild = this.autocompleteMenuElement.children[this.selectedAutocompleteIndex] as HTMLElement | undefined;
                        if (selectedChild) {
                            selectedChild.click();
                        }
                    }
                    this.selectedAutocompleteIndex = -1;
            }
        });
    }

    selectAutocompleteMenuItem(index: number) {
        this.selectedAutocompleteIndex = index;
        const menuItems = Array.from(this.autocompleteMenuElement.children);
        for (let i = 0; i < menuItems.length; i++) {
            if (i === index) {
                menuItems[i].classList.add('selected')
            } else {
                menuItems[i].classList.remove('selected')
            }
        }

    }

    saveCursor(e: Event) {
        const target = e.target as HTMLInputElement;
        this.currentCursorPostion = target?.selectionStart ?? 0;
    }

    /**
     * 
     */
    showAutocompleteMenu(show: boolean) {
        const isHidden = this.autocompleteMenuElement.classList.contains('hidden');

        if (!show) {
            if (!isHidden) {
                this.isAutocompleteVisible = false;
                this.autocompleteMenuElement.classList.add('hidden');
            }
            return;
        }

        this.isAutocompleteVisible = true;
        this.selectedAutocompleteIndex = -1;
        this.autocompleteMenuElement.classList.remove('hidden');

    }

}