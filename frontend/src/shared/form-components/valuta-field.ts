import { TranslationDto } from '../model/types';
import { Form } from './form';
import { TextField } from './text-field';

export class ValutaField extends TextField {
    constructor(name: string, labels: TranslationDto[] | undefined, form?: Form, id: string | undefined = undefined) {
        super(name, labels, form, id);

        this.inputElement.addEventListener("keypress", (e) => {
            if (!/[0-9,]/.test(e.key)) {
                e.preventDefault(); 
            }
        });
    }

    setValue(value: string | undefined, noCallback: boolean = false) {
        // Format the value as currency
        super.setValue(this.formatCurrency(value ?? ''), noCallback);
        return this;
    }

    formatCurrency(value: string) {
        if (value === null || value === undefined || value === '')
            return '';
        value = Number.parseFloat(value.replace(',', '.')).toFixed(2)
        if (Number.isNaN(Number(value))) {
            return '';
        }
        return value.replace('.', ',');
    }

    clone() {
        const field = new ValutaField(this.name, this.labels, this.form, this.id);
        field.setType(this.type);
        field.setValue(this.value);
        field.setClasses(this.classes);
        field.setRequired(this.required);
        field.setReadonly(this.readonly);
        field.setMinLength(this.minLength);
        field.setMaxLength(this.maxLength);
        field.validators = this.validators;
        return field;
    }
}
