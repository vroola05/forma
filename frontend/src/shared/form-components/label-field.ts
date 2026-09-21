import { TranslationDto } from '../model/types';
import { InputNucleus } from './interface/input-base';

export class LabelField extends InputNucleus<HTMLDivElement> {
    
    constructor(name: string, labels: TranslationDto[] | undefined, id: string | undefined = undefined) {
        super(document.createElement('div'), name, labels, id);
        this.type = 'label';

        this.createElement();
    }

    createElement() {
        
        this.inputElement.id = this.getId();
        
        this.inputElement.innerHTML = this.getValue();
        this.createInput(this.inputElement);
    }

    setType(type: string) {
        this.type = type;
        return this;
    }

    validate() {
        return true;
    }

    setValue(value: string | undefined, noCallback: boolean = false) {
        this.value = value ?? '';
        this.inputElement.innerHTML = this.value;
        return this;
    }

    clone() {
        const labelField = new LabelField(this.name, this.labels);
        labelField.setType(this.type);
        labelField.setValue(this.value);
        labelField.setClasses(this.classes);

        return labelField;
    }
}