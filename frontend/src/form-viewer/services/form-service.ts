import { Nucleus } from '../../shared/form-components/interface/nucleus';
import { Form } from '../../shared/form-components/form';

export class FormService {
    static instance: FormService | null = null;

    fields: Nucleus[] = [];

    form: Form | undefined;
    formChangeListeners: ((form: Form) => void)[] = [];

    stateTimeout = -1;

    

    constructor() {
    }

    static getInstance() {
        if (FormService.instance == null) {
            FormService.instance = new FormService();
        }
        return FormService.instance;
    }

    addEventListener(callback: (form: Form) => void): void {
        this.formChangeListeners.push(callback);
    }

    getForm(): Form | undefined {
        return this.form;
    }

    setForm(form: Form): void {
        this.form = form;
        for ( const callback of this.formChangeListeners ) {
            callback(form);
        };
    }

    addNucleus(field: Nucleus): void {
        this.fields.push(field);
    }

    getNucleus(): Nucleus[] {
        return this.fields;
    }
}