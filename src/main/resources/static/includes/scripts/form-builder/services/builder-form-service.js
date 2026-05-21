import { Observable } from '../../shared/services/observable.js';

export class BuilderFormService {
    static #builderForm = new Observable(undefined);
    static #formWrapper = new Observable(undefined);
    
    static getBuilderForm() {
        return this.#builderForm.value;
    }

    static setBuilderForm(builderForm) {
        this.#builderForm.value = builderForm;
    }

    static getFormWrapper() {
        return this.#formWrapper.value;
    }

    static setFormWrapper(formWrapper) {
        this.#formWrapper.value = formWrapper;

    }

    static formWrapperSubscription(callback) {
        return this.#formWrapper.subscribe(callback);
    }
}