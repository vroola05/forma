import { TranslationDto } from '../model/types';
import { Form } from './form';
import { TextField } from './text-field';

export class DateField extends TextField {
    constructor(name: string, labels: TranslationDto[] | undefined, form?: Form, id: string | undefined = undefined) {
        super(name, labels, form, id);
    }

    setValue(value: string | undefined, noCallback = false) {
        if (!value) {
            value = '';
        }

        const dateValue = new Date(value);
        if (dateValue instanceof Date && !isNaN(dateValue.getTime())) {
            const yyyy = dateValue.getFullYear();
            const mm = String(dateValue.getMonth() + 1).padStart(2, "0");
            const dd = String(dateValue.getDate()).padStart(2, "0");
            value = `${yyyy}-${mm}-${dd}`;
        }
        
        super.setValue(value, noCallback);
        return this;
    }

    clone() {
        const field = new DateField(this.name, this.labels, this.form);
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