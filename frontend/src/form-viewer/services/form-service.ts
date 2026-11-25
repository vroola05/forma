import { Form } from '../../shared/form-components/form';
import { Nucleus } from '../../shared/form-components/interface/nucleus';

export class FormServiceInstance {
    #fields: Nucleus[] = [];

    #form: Form | undefined;
    #formChangeListeners: ((form: Form) => void)[] = [];

    constructor(form:Form) {
        this.#form = form;
        this.#fields = [];
        this.#formChangeListeners = [];
    }

    addEventListener(callback: (form: Form) => void): void {
        this.#formChangeListeners.push(callback);
    }

    getForm(): Form | undefined {
        return this.#form;
    }

    formReady() {
        if (!this.#form) {
            console.error('Form is not yet ready')
            return;
        }

        for ( const callback of this.#formChangeListeners ) {
            callback(this.#form);
        };
    }

    addNucleus(field: Nucleus): void {
        this.#fields.push(field);
    }

    getNucleus(): Nucleus[] {
        return this.#fields;
    }
}

export class FormServiceImpl {
    #forms = new Map<string, FormServiceInstance>();
    
    addEventListener(formName: string, callback: (form: Form) => void): void {
        if (formName === undefined || !this.#forms.has(formName)) {
            return;
        }

        this.#forms.get(formName)?.addEventListener(callback);
    }

    getForm(formName: string): Form | undefined {
        if (formName && this.#forms.has(formName)) {
            return this.#forms.get(formName)?.getForm();
        }

        return undefined;
    }

    setForm(form: Form): void {
        if (this.#forms.has(form.getName())) {
            this.#forms.delete(form.getName());
        }
        this.#forms.set(form.getName(), new FormServiceInstance(form))
    }

    formReady(formName: string): void {
        if (formName === undefined || !this.#forms.has(formName)) {
            return
        }

        this.#forms.get(formName)?.formReady()
    }

    addNucleus(formName: string, field: Nucleus): void {
        if (formName === undefined || !this.#forms.has(formName)) {
            return
        }
        this.#forms.get(formName)?.addNucleus(field);
    }

    getNucleus(formName: string): Nucleus[] {
        if (formName === undefined || !this.#forms.has(formName)) {
            return []
        }
        return this.#forms.get(formName)?.getNucleus()?? [];
    }
}

export const FormService = new FormServiceImpl();