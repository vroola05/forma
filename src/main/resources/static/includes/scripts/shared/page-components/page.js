import { footerService } from '../services/footer-service.js';
import { Storage } from '../services/storage-service.js';

export class Page {
    parameters = undefined;
    content = '';
    title = '';

    constructor() {
        Storage.setPage(this.constructor.name);
        footerService.clear();
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
            const parametersString = Storage.getPageItem('params');
            if (parametersString) {
                this.parameters = JSON.parse(parametersString);
            }
        }
        return this.parameters;
    }

    setPageParameters(values) {
        Storage.setPageItem('params', JSON.stringify(values));
        this.parameters = values;
    }

}