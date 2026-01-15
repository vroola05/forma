import { FormGroup } from '../form/form-group.js';

export class Page {
    parameters = undefined;
    content = '';
    title = '';

    constructor() {
        FormGroup.setPage(this.constructor.name);
        this.getPageParameters();
    }

    setContent(content) {
        this.content = content;
    }

    getContent() {
        return this.content;
    }

    setTitle(title) {
        this.title = title;
        document.title = title;
    }

    getTitle() {
        return this.title;
    }

    afterInit() {
        
    }

    getPageParameters() {
        if (!this.parameters) {
            const parametersString = sessionStorage.getItem(FormGroup.page + '-params');
            if (parametersString) {
                this.parameters = JSON.parse(parametersString);
            }
        }
        return this.parameters;
    }

    setPageParameters(values) {
        sessionStorage.setItem(FormGroup.page + '-params', JSON.stringify(values));
        this.parameters = values;
    }
}