import { Observable } from '../../shared/services/observable';
import { BuilderFieldInterface } from '../fields/builder-field-interface';

export class BuilderPropertiesService {
    static #builderFieldInterfaces = new Observable<BuilderFieldInterface>(undefined);
    static #builderFieldPropertiesLabel = new Observable<string>(undefined);

    static #validationErrors: any = undefined;

    static subscribe(subscribe: (value: BuilderFieldInterface | undefined) => void) {
        return this.#builderFieldInterfaces.subscribe(subscribe);
    }

    static set(builderFieldInterface: BuilderFieldInterface | undefined, validationErrors: any = undefined) {
        this.#validationErrors = validationErrors;

        return this.#builderFieldInterfaces.value = builderFieldInterface;
    }

    static subscribeLabel(subscribe: (value: string | undefined) => void) {
        return this.#builderFieldPropertiesLabel.subscribe(subscribe);
    }

    static setLabel(label: string) {
        return this.#builderFieldPropertiesLabel.value = label;
    }
    static hasValidationErrors() {
        return this.#validationErrors;
    }

    static getValidationErrors() {
        return Object.freeze(this.#validationErrors);
    }

    static clear() {
        this.#validationErrors = [];
        
        return this.#builderFieldInterfaces.value = undefined;
    }

}