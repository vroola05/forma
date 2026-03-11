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
        // Input
        this.inputElement = document.createElement('div');
        this.inputElement.id = this.name;
        
        this.inputElement.innerHTML = this.getValue();
        this.createInput(this.inputElement);
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
        this.value = value ?? '';
        this.inputElement.innerHTML = this.value;
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