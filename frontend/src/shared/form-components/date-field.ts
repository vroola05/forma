import { TranslationDto } from '../model/types';
import { TextField } from './text-field';

export class DateField extends TextField {
    constructor(name: string, labels: TranslationDto[] | undefined, id: string | undefined = undefined) {
        super(name, labels, id);
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
}