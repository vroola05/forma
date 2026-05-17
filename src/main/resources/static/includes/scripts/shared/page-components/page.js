import { footerService } from '../services/footer-service.js';
import { Storage } from '../services/storage-service.js';
import { PageComponent } from './page-component.js';

export class Page extends PageComponent {
    parameters = undefined;
    content = '';
    title = '';

    constructor() {
        super();
        Storage.setPage(this.constructor.name);
        footerService.clear();
        this.getPageParameters();
    }

    

    setTitle(title) {
        this.title = title;
        document.title = title;
    }

    getTitle() {
        return this.title;
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
