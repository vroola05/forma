import { TextField } from './text-field.js';

export class ValutaField extends TextField {
    constructor(name, label) {
        super(name, label);

        this.inputElement.addEventListener("keypress", (e) => {
            if (!/[0-9,]/.test(e.key)) {
                e.preventDefault(); 
            }
        });
    }

    setValue(value, noCallback = false) {
        // Format the value as currency
        super.setValue(this.formatCurrency(value), noCallback);
        return this;
    }

    formatCurrency(value) {
        if (value === null || value === undefined || value === '')
            return '';
        // Zorg dat het een float is en altijd twee decimalen toont
        value = parseFloat(value.replace(',', '.')).toFixed(2)
        if (isNaN(value)) {
            return '';
        }
        return value.replace('.', ',');
    }
}
