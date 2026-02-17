import { TextField } from './text-field.js';

export class DateField extends TextField {
    constructor(name, label) {
        super(name, label);
    }
    
    setValue(value, noCallback = false) {
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