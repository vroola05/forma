import { FormRenderer } from '../components/form-renderer.js';
import { Storage } from '../../shared/services/storage-service.js';

export class FormService {
    static instance = null;

    fields = [];

    form = undefined;
    formChangeListeners = [];

    stateTimeout = -1;

    static getInstance() {
        if (FormService.instance == null) {
            FormService.instance = new FormService();
        }
        return FormService.instance;
    }

    constructor() {
    }

    getState() {
        const state = Storage.getPageItem('form-state');
        return state ? JSON.parse(state) : {};
    }

    saveState() {
        if (this.stateTimeout > -1) {
            clearTimeout(this.stateTimeout);
        }

        this.stateTimeout = setTimeout(() => {
            Storage.setPageItem('form-state', JSON.stringify(FormRenderer.getFormKeyVal(this.form)))
        }, 200);
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

    getNucleus() {
        return this.fields;
    }
}