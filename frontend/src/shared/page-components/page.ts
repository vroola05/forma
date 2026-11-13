import { Storage } from '../services/storage-service';
import { PageComponent } from './page-component';

export class Page extends PageComponent {
    parameters: { [key: string]: any } | undefined = undefined;
    content = document.createElement('div');
    title = '';

    constructor(updateActivePage: boolean = true) {
        super();
        this.content.className = 'page-content';
        if (updateActivePage) {
            Storage.setPage(this.constructor.name);
        }
        
        this.getPageParameters();
    }

    setTitle(title: string) {
        this.title = title;
        document.title = title;
    }

    getTitle(): string {
        return this.title;
    }

    getPageParameters():  {[key: string]: any } | undefined {
        if (!this.parameters) {
            const parametersString = Storage.getPageItem('params');
            if (parametersString) {
                this.parameters = JSON.parse(parametersString);
            }
        }
        return this.parameters;
    }

    setPageParameters(values: { [key: string]: any }) {
        Storage.setPageItem('params', JSON.stringify(values));
        this.parameters = values;
    }

}
