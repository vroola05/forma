import { TranslationDto } from '../model/types';
import { Form } from './form';
import { InputNucleus } from './interface/input-base';

/**
 * HiddenField
 */
export class HiddenField extends InputNucleus<HTMLInputElement> {
    
    constructor(name: string, labels: TranslationDto[] | undefined, form?: Form, id: string | undefined = undefined) {
        super(document.createElement('input'), name, labels, form, id);
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
        const hiddenfield = new HiddenField(this.name, this.labels, this.form, this.id);
        hiddenfield.setType(this.type);
        hiddenfield.setValue(this.value);
        return hiddenfield;
    }
}