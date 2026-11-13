import { Form } from '../../shared/form-components/form';
import { FormWrapper } from '../../shared/model/types';
import { Observable } from '../../shared/services/observable';
import { BuilderForm } from '../fields/builder-form';

export class BuilderFormService {
    #builderForm = new Observable<BuilderForm>(undefined);
    // #variablesForm = new Observable<Form>(undefined);
    #forms = new Map<string, Observable<Form | undefined>>();
    #formWrapper = new Observable<FormWrapper>(undefined);
    
    getBuilderForm() {
        return this.#builderForm.value;
    }

    setBuilderForm(builderForm: BuilderForm | undefined) {
        this.#builderForm.value = builderForm;
    }

    subscribeToBuilderForm(subscribe: (value: BuilderForm | undefined) => void) {
        return this.#builderForm.subscribe(subscribe);
    }

    #getOrCreateObservable(key: string): Observable<Form | undefined> {
        if (!this.#forms.has(key)) {
            this.#forms.set(key, new Observable<Form | undefined>(undefined));
        }
        return this.#forms.get(key)!;
    }

    getForm(key: string): Form | undefined {
        return this.#getOrCreateObservable(key).value;
    }

    setForm(value: Form): void {
        this.#getOrCreateObservable(value.getId()).value = value;
    }

    subscribeToForm(key: string, subscribe: (value: Form | undefined) => void) {
        return this.#getOrCreateObservable(key).subscribe(subscribe);
    }

    getFormWrapper() {
        return this.#formWrapper.value;
    }

    setFormWrapper(formWrapper: FormWrapper | undefined) {
        this.#formWrapper.value = formWrapper;
    }

    subscribeToFormWrapper(subscribe: (value: FormWrapper | undefined) => void) {
        return this.#formWrapper.subscribe(subscribe);
    }
}


export class BuilderFormServiceRegistryImpl {
    #instances = new Map<string, BuilderFormService>();

    get(formId: string): BuilderFormService {
        if (!this.#instances.has(formId)) {
            this.#instances.set(formId, new BuilderFormService());
        }
        return this.#instances.get(formId)!
    }

    destroy(formId: string): void {
        this.#instances.delete(formId);
    }
}

/**
 * Use this to receive the correct form-service
 */
export const BuilderFormServiceRegistry = new BuilderFormServiceRegistryImpl();