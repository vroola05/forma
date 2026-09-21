import { TranslationDto } from '../model/types';
import { InputNucleus } from './interface/input-base';

/**
 * HiddenField
 */
export class HiddenField extends InputNucleus<HTMLInputElement> {
    
    constructor(name: string, labels: TranslationDto[] | undefined, id: string | undefined = undefined) {
        super(document.createElement('input'), name, labels, id);
        this.type = 'hidden';

        this.createElement();
    }

    createElement() {
        // Input
        this.inputElement.type = 'hidden';
        this.inputElement.name = this.name;
        this.inputElement.id = this.getId();
        this.inputElement.value = this.getValue();
    }

    setType(type: string) {
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
        const hiddenfield = new HiddenField(this.name, this.labels);
        hiddenfield.setType(this.type);
        hiddenfield.setValue(this.value);
        return hiddenfield;
    }
}