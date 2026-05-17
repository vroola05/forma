import { Router } from '../../shared/services/router.js';
import { Page } from '../../shared/page-components/page.js';
import { Http } from '../../shared/services/http.js';
import { FormGroup } from '../../shared/form-components/form-group.js';
import { FormConfigSuccessPage, FormSubmission } from '../../shared/model/form-data.js';

import { FormService } from '../services/form-service.js'
import { Storage } from '../../shared/services/storage-service.js';

export class SuccessPage extends Page {
    content = document.createElement('div');
    pageContentContainer = document.createElement('div');
    formContainer = document.createElement('div');

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

        this.formContainer.className = 'form-container success-page';
        this.pageContentContainer.appendChild(this.formContainer);
        
        //form-container
    }

    afterInit() {
        let formSubmission = Router.getDataParameter('formSubmission');
        if (!formSubmission) {
            const formSubmissionData = Storage.getPageItem('formSubmission');
            if (formSubmissionData) {
                console.log(JSON.parse(formSubmissionData));
                formSubmission = new FormSubmission(JSON.parse(formSubmissionData));
            }
        } else {
            Storage.setPageItem('formSubmission', JSON.stringify(formSubmission));
        }

        Http.post(`${Router.tenantPath}/api/forms/success-page`, formSubmission, {})
            .then(formConfigSuccessPageData => {
                const formConfigSuccessPage = new FormConfigSuccessPage(formConfigSuccessPageData);

                if (formConfigSuccessPage.content) {
                    this.formContainer.innerHTML = formConfigSuccessPage.content;
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
