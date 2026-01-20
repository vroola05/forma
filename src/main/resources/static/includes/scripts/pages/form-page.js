import { Router } from '../router.js';
import { Page } from './page.js';
import { FormRenderer } from '../components/form-renderer.js'

import { FormGroup } from '../form/form-group.js';
import { Http, ValidationError } from '../util/http.js';
import { Footer } from '../components/footer.js';
import { Toaster } from '../toaster.js'
import { FormLogic } from './form-logic.js';
import { FormService } from '../services/form-service.js'

export class FormPage extends Page {
    content = document.createElement('div');
    pageContentContainer = document.createElement('div');
    buttonCancel = document.createElement('div');
    buttonSubmit = document.createElement('div');
    loader = document.querySelector('.loader');
    projectName = '';
    groups = [];

    constructor() {
        super();

        if (Router.lastParams && 'formName' in Router.lastParams && Router.lastParams.formName) {
            this.formName = Router.lastParams.formName;
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

        this.footerContainer = document.createElement('div');
        this.footerContainer.className = 'footer-container';
        this.content.append(this.footerContainer);

    }

    afterInit() {
        this.getForm(this.formName);
    }

    getForm(formName) {
        this.loader.classList.add('active');
        Http.get(`${Router.base}/api/forms/${formName}`, {})
            .then(formWrapper => {
                this.loader.classList.remove('active');
                if (!formWrapper) {
                    console.error('No fields found in the project details');
                    return;
                }
                
                this.formWrapper = formWrapper;
                this.setTitle(this.formWrapper.form.label);

                this.form = FormRenderer.createForm(this.formWrapper.form);
                this.pageContentContainer.append(this.form.getContent());

                this.footer = new Footer();
                this.footerContainer.append(this.footer.getContent());

                const formService = FormService.getInstance();
                formService.setForm(this.form);
                
                const fields = formService.getNucleus();

                // Logic that needs to be initialized after the form is loaded.
                // For example the showconditions
                for (let i=0; i < fields.length; i++) {
                    fields[i].afterFormInit();
                }

                this.formLogic = new FormLogic(this.form, this.footer);
            })
            .catch(error => {
                this.loader.classList.remove('active');
                if (error instanceof ValidationError) {
                    Toaster.error('Er is iets fout gegaan. Controleer of alle velden goed zijn ingevuld.');
                }
            });
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
