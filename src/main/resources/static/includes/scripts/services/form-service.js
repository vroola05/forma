

export class FormService {
    static instance = null;

    fields = [];

    form = undefined;
    formChangeListeners = [];

    static getInstance() {
        if (FormService.instance == null) {
            FormService.instance = new FormService();
        }
        return FormService.instance;
    }

    constructor() {
    }

    addEventListener(callback) {
        this.formChangeListeners.push(callback);
    }

    getForm() {
        return this.form;
    }

    setForm(form) {
        this.form = form;
        for ( const callback of this.formChangeListeners ) {
            callback(form);
        };
    }

    addNucleus(field) {
        this.fields.push(field);
    }

    getFields(fields) {
        return this.fields;
    }
}