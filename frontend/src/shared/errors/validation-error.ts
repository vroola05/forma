import { BuilderFieldInterface } from "../../form-builder/fields/builder-field-interface";

export class ValidationError extends Error {
    fieldName: string;
    field: BuilderFieldInterface | null = null;

    constructor(fieldName: string, message: string) {
        super(message);
        this.fieldName = fieldName;
        this.name = "ApiError";
    }

    setField(field: BuilderFieldInterface) {
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
        let current: BuilderFieldInterface | null = this.field;

        while (current) {
            parts.unshift(current.getFieldIdentifier()); // Voeg toe aan het begin
            current = current.getParent();
        }

        return parts.join(seperator);
    }
}