import { ObservableState } from '../../shared/services/observable-state.js';

export class BuilderFormService {
    static #builderForm = new ObservableState(undefined);
    static #formWrapper = new ObservableState(undefined);
    
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