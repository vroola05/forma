import { FormWrapper } from '../../shared/model/types';
import { Observable } from '../../shared/services/observable';
import { BuilderForm } from '../fields/builder-form';

export class BuilderFormService {
    static #builderForm = new Observable<BuilderForm>(undefined);
    static #formWrapper = new Observable<FormWrapper>(undefined);
    
    static getBuilderForm() {
        return this.#builderForm.value;
    }

    static setBuilderForm(builderForm: BuilderForm | undefined) {
        this.#builderForm.value = builderForm;
    }

    static getFormWrapper() {
        return this.#formWrapper.value;
    }

    static setFormWrapper(formWrapper: FormWrapper | undefined) {
        this.#formWrapper.value = formWrapper;

    }

    static formWrapperSubscription(subscribe: (value: FormWrapper | undefined) => void) {
        return this.#formWrapper.subscribe(subscribe);
    }
}