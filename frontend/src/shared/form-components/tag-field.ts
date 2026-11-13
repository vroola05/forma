import { OptionDto, TranslationDto } from '../model/types';
import { Lang } from '../services/lang';
import { InputNucleus } from './interface/input-base';

export class TagField extends InputNucleus<HTMLDivElement> {
    tagContainer = document.createElement('div');


    constructor(name: string, labels: TranslationDto[] | undefined = undefined, classes: string | undefined = undefined, id: string | undefined = undefined) {
        super(document.createElement('div'), name, labels, id);
        this.type = 'tag';
        this.value = [];
        
        this.inputElement.id = this.getId();
        this.inputElement.className = 'tag-input-wrapper form-control';
        
        this.tagContainer.className = 'tag-container';
        this.inputElement.appendChild(this.tagContainer);

        const tagInput = document.createElement('input');
        tagInput.type = 'text';
        tagInput.className = 'tag-input';
        tagInput.placeholder = 'Enter a tag and press Enter';
        this.inputElement.appendChild(tagInput);

        tagInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' && tagInput.value.trim() !== '') {
                event.preventDefault();
                this.addTag(tagInput.value);
                this.updateValue();
                tagInput.value = '';
            }
        });

        this.setClasses(classes);
        this.createInput(this.inputElement);
    }

    hasTag(tagValue: string) {
        const value = this.value as OptionDto[];
        return value === undefined ? false : value.some(tagOption => tagOption.value === tagValue);
    }

    addTag(tagValue: string) {
        tagValue = tagValue.trim().toLocaleLowerCase();
        if (!tagValue) {
            return;
        }

        if (this.hasTag(tagValue)) {
            return;
        }

        const tagElement = document.createElement('span');
        tagElement.className = 'tag';
        
        const tagLabel = document.createElement('span');
        tagLabel.className = 'tag-label icon icon-tag';

        const tagText = document.createElement('span');
        tagText.className = 'tag-text';
        tagText.textContent = tagValue;

        const removeButton = document.createElement('button');
        removeButton.className = 'tag-button-remove icon icon-x-lg';
        removeButton.textContent = '';
        removeButton.addEventListener('click', (e) => {
            e.preventDefault();

            tagElement.remove();
            this.updateValue();
        });

        tagElement.append(
            tagLabel,
            tagText,
            removeButton
        );

        this.tagContainer.appendChild(tagElement);
    }

    updateValue() {
        const tagContainers = this.tagContainer.querySelectorAll('.tag-text') as NodeListOf<HTMLDivElement>;
        const tags = Array.from(tagContainers).map(tag => {
            const value = tag.textContent || '';
            return { value: value, text: value };
        });

        this.value = tags;
        this.valueChanged(false, this.value);
    }

    setType(type: string) {
        this.type = type;
        return this;
    }

    addOptions(options: { value: string, selected?: boolean }[] | undefined) {
        if (!options) {
            return this;
        }

        options.forEach(option => {
            if (option.selected) {
                this.addTag(option.value);
            }
        });

        return this;
    }

    getOptions() {
        return this.value;
    }
    
    setValue(options: OptionDto[] | undefined, noCallback = false) {
        if (!options || !Array.isArray(options)) {
            return this;
        }

        options.forEach(option => {
            
            this.addTag(option.value);
        });

        this.value = options;
        this.valueChanged(noCallback, this.value);
        return this;
    }

    getValue(): OptionDto[] | undefined {
        return this.value as OptionDto[];
    }

    validate(): boolean {
        let isValid = true;
        if (!this.getShow()) {
            return isValid;
        }
        if (this.required && (!this.value || (Array.isArray(this.value) && this.value.length === 0))) {
            isValid = false;
            this.errors.push(Lang.get('generic.validation.required'));
        }

        this.setValidationState(isValid);
        return isValid;
    }

    clone() {
        const tagField = new TagField(this.name, this.labels);
        tagField.setType(this.type);
        tagField.setValue(this.value);
        tagField.setClasses(this.classes);

        return tagField;
    }
}