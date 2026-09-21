import { Form } from '../../shared/form-components/form';
import { Nucleus } from '../../shared/form-components/interface/nucleus';

export class FormService {
    static #fields: Nucleus[] = [];

    static #form: Form | undefined;
    static #formChangeListeners: ((form: Form) => void)[] = [];

    static addEventListener(callback: (form: Form) => void): void {
        this.#formChangeListeners.push(callback);
    }

    static getForm(): Form | undefined {
        return this.#form;
    }

    static setForm(form: Form): void {
        this.#fields = [];
        this.#formChangeListeners = [];
        this.#form = form;
    }

    static formReady() {
        if (!this.#form) {
            console.error('Form is not yet ready')
            return;
        }

        for ( const callback of this.#formChangeListeners ) {
            callback(this.#form);
        };
    }

    static addNucleus(field: Nucleus): void {
        this.#fields.push(field);
    }

    static getNucleus(): Nucleus[] {
        return this.#fields;
    }
}