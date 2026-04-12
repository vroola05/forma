import { Router } from '../../shared/services/router.js';
import { Page } from '../../shared/page-components/page.js';

import { FormGroup } from '../../shared/form-components/form-group.js';

import { FormService } from '../services/form-service.js'

export class SuccessPage extends Page {
    content = document.createElement('div');
    pageContentContainer = document.createElement('div');
    buttonCancel = document.createElement('div');
    buttonSubmit = document.createElement('div');
    loader = document.querySelector('.loader');
    formService = FormService.getInstance();

    projectName = '';
    groups = [];

    constructor() {
        super();

        const formNameUrlParam = Router.getUrlParameter('formName');
        if (formNameUrlParam) {
            this.formName = formNameUrlParam;
            if (this.parameters && 'formName' in this.parameters && this.parameters.formName != this.formName) {
                console.log('Clear because other id.');
                FormGroup.clearPage(this.constructor.name);
            }

            this.setPageParameters({ formName: this.formName });
        
            this.createContent();

            this.setTitle('Formulier');
        }
    }

    createContent() {
        this.content.className = 'page-wrapper';

        this.pageTitle = document.createElement('h1');
        this.pageTitle.className = 'page-title';
        this.pageTitle.innerHTML = '';
        this.content.append(this.pageTitle);

        this.pageContentContainer.id = 'page-content-container';
        this.pageContentContainer.className = 'page-content-container';
        this.content.append(this.pageContentContainer);
    }

    afterInit() {
        
    }

    

    setTitle(title) {
        this.title = title;

        const titleDom = document.createElement('span');
        titleDom.innerHTML = title;

        this.pageTitle.innerHTML = '';
        this.pageTitle.appendChild(titleDom);
        document.title = title;
    }

    
}
