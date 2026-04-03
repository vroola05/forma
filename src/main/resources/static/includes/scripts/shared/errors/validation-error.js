export class ValidationError extends Error {
    constructor(fieldName, message) {
        super(message);
        this.fieldName = fieldName;
        this.name = "ValidationError";
    }

    setField(field) {
        this.field = field;
        return this;
    }

    getField() {
        return this.field;
    }

    /**
     * Returns the path of the field seperated by
     * @returns - string
     */
    getPath(seperator = ' - ') {
        if (!this.field) return this.message;

        const parts = [];
        let current = this.field;

        while (current) {
            parts.unshift(current.getFieldIdentifier()); // Voeg toe aan het begin
            current = current.getParent();
        }

        return parts.join(seperator);
    }
}