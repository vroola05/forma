import { Footer } from '../../shared/generic-components/footer';
import { Header } from '../../shared/generic-components/header';
import { FormSubmission } from '../../shared/model/types';
import { Page } from '../../shared/page-components/page';
import { Http } from '../../shared/services/http';
import { Router } from '../../shared/services/router';

import { Storage } from '../../shared/services/storage-service';
import { FormService } from '../services/form-service';

export class SuccessPage extends Page {
    content = document.createElement('div');
    pageContentContainer = document.createElement('div');
    formContainer = document.createElement('div');
    pageTitle = document.createElement('h1');

    header: Header = new Header();
    footer: Footer = new Footer();

    formService = FormService.getInstance();

    formName: string = '';
    projectName: string = '';

    constructor() {
        super();

        const formNameUrlParam = Router.getUrlParameter('formName');

        if (formNameUrlParam) {
            this.formName = formNameUrlParam;
            this.setPageParameters({ formName: this.formName });
        
            this.createContent();

            this.setTitle('Formulier');
        }
    }

    createContent() {
        this.content.className = 'page-wrapper';

        this.pageTitle.className = 'page-title';
        this.pageTitle.innerHTML = '';
        this.content.append(this.pageTitle);

        this.pageContentContainer.id = 'page-content-container';
        this.pageContentContainer.className = 'page-content-container';
        this.content.append(this.pageContentContainer);

        this.formContainer.className = 'form-container success-page';
        this.pageContentContainer.appendChild(this.formContainer);

    }

    afterInit() {
        let formSubmission = Router.getDataParameter('formSubmission') as FormSubmission;
        if (!formSubmission) {
            const formSubmissionData = Storage.getPageItem('formSubmission');
            if (formSubmissionData) {
                formSubmission = JSON.parse(formSubmissionData) as FormSubmission;
            }
        } else {
            Storage.setPageItem('formSubmission', JSON.stringify(formSubmission));
        }

        Http.post(`${Router.tenantPath}/api/forms/success-page`, formSubmission, {})
            .then(formConfigSuccessPageData => {
                const formConfigSuccessPage = formConfigSuccessPageData as FormSubmission;

                if (formConfigSuccessPage.content) {
                    this.formContainer.innerHTML = formConfigSuccessPage.content;
                }
                
            }).catch(() => {});
    }

    

    setTitle(title: string) {
        this.title = title;

        const titleDom = document.createElement('span');
        titleDom.innerHTML = title;

        this.pageTitle.innerHTML = '';
        this.pageTitle.appendChild(titleDom);
        document.title = title;
    }

    getContent() {
        const fragment = document.createDocumentFragment();
        fragment.append(
            this.header.getContent(),
            this.content,
            this.footer.getContent());

        return fragment;
    }
    
}
