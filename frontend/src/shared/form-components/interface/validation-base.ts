import { Nucleus } from "./nucleus";

export class ValidationBase {
    handleValidationError(errorMap : Map<string, any>) {
        for (const [key, errors] of errorMap) {
            if (key === 'fields') {
                this.#handleFieldErrors(errors);
                continue;
            }

            if (Array.isArray(errors)) {
                this.setBackendErrorsField(false, errors);
            }
        }
    }

    #handleFieldErrors(fieldErrorsMap: Map<string, any>) {
        const fields = this.getFields() || [];
        for (const [key, errors] of fieldErrorsMap) {
            const index = Number(key);
            if (Number.isNaN(index)) continue;

            const field = fields[index];
            if (field) {
                field.handleValidationError(errors);
            }
        }
    }

    getFields(): Nucleus[] | null {
        return null;
    }

    getSets(): Nucleus[][] {
        return [];
    }

    setBackendErrorsField(valid: boolean, errors: any) {
    }   
}