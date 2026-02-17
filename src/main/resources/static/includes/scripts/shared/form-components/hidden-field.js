import { InputNucleus } from './interface/input-base.js';

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