import { Nucleus } from "./nucleus";


/**
 * When the validation fails on the backend it sends back an object that looks like this in structure.
 * The functions in this class loop over the object and its nested fields to show the error message on the 
 * correct field.
 *  
 * {
 *      "fields": {
 *          "0": {
 *              "fields": {
 *                  "0": {
 *                      "het-bovenste-veld": [
 *                          "Dit veld is verplicht."
 *                      ]
 *                  },
 *                  "1": {
 *                      "fields": {
 *                          "0": {
 *                              "first-name": [
 *                                  "Het minimum aantal tekens is 5"
 *                              ]
 *                          }
 *                      }
 *                  },
 *                  "3": {
 *                      "sets": {
 *                          "1": {
 *                              "1": {
 *                                  "nummer-veld-2": [
 *                                      "Het minimum aantal tekens is 12"
 *                                  ]
 *                              },
 *                              "2": {
 *                                  "nummer-veld-1": [
 *                                      "Het minimum aantal tekens is 13"
 *                                  ]
 *                              }
 *                          }
 *                      }
 *                  }
 *              }
 *          }
 *      }
 *  }
 * 
 */
export class ValidationBase {
    handleValidationError(errorMap : Map<string, any>) {
        for (const [key, errors] of errorMap) {
            if (key === 'fields') {
                this.#handleFieldErrors(errors);
                continue;
            }

            if (key === 'sets') {
                this.#handleSetErrors(errors);
                continue;
            }

            if (Array.isArray(errors)) {
                this.setBackendErrorsField(false, errors);
            }
        }
    }

    #handleSetErrors(fieldErrorsMap: Map<string, any>) {
        const sets = this.getSets() || [];
        for (const [key, errors] of fieldErrorsMap) {
            const index = Number(key);
            if (Number.isNaN(index)) {
                continue;
            }
            if (index >= sets.length) {
                continue;
            }
            const set = sets[index];
            
            for (const [fieldKey, fieldErrors] of errors) {
                const fieldIndex = Number(fieldKey);
                if (Number.isNaN(fieldIndex)) {
                    continue;
                }

                if (fieldIndex >= set.length) {
                    continue;
                }

                set[fieldIndex].handleValidationError(fieldErrors);
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