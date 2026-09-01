import { TranslationDto } from '../model/types';
import { TextField } from './text-field';

export class ValutaField extends TextField {
    constructor(name: string, labels: TranslationDto[] | undefined, id: string | undefined = undefined) {
        super(name, labels, id);

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
}
