import { Router } from '../../shared/services/router.js';
import { Page } from '../../shared/page-components/page.js';
import { FormRenderer } from '../components/form-renderer.js'

import { FormGroup } from '../../shared/form-components/form-group.js';
import { Http, ValidationError } from '../../shared/services/http.js';

import { Toaster } from '../../shared/generic-components/toaster.js'
import { FormLogic } from '../components/form-logic.js';
import { FormService } from '../services/form-service.js'
import { Header } from '../../shared/generic-components/header.js';
import { Footer } from '../../shared/generic-components/footer.js';

export class FormPage extends Page {
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

            this.header = new Header();
            this.footer = new Footer();
        }
    }

    getContent() {

        const fragment = document.createDocumentFragment();
        fragment.append(
            this.header.getContent(),
            this.content,
            this.footer.getContent());

        return fragment;
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
        this.getForm(this.formName);
    }

    getForm(formName) {
        this.loader.classList.add('active');
        Http.get(`${Router.tenantPath}/api/forms/${formName}`, {})
            .then(formWrapper => {
                this.loader.classList.remove('active');
                
                if (!formWrapper) {
                    console.error('No fields found in the project details');
                    return;
                }
                
                this.formWrapper = formWrapper;
                this.setTitle(this.formWrapper.form.label);

                const state = this.formService.getState();
                this.form = FormRenderer.createForm(this.formWrapper.form, state);
                this.pageContentContainer.append(this.form.getContent());
                this.formService.setForm(this.form);

                const fields = this.formService.getNucleus();

                
                // Logic that needs to be initialized after the form is loaded.
                // For example the showconditions
                for (let i=0; i < fields.length; i++) {
                    fields[i].afterFormInit();
                }
                this.formLogic = new FormLogic(this.form);
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
