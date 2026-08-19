import { FormRenderer } from '../../shared/generic-components/form-renderer';
import { Page } from '../../shared/page-components/page';
import { Router } from '../../shared/services/router';

import { Form } from '../../shared/form-components/form';
import { FileUploadField } from '../../shared/form-components/upload-field';
import { Footer } from '../../shared/generic-components/footer';
import { Header } from '../../shared/generic-components/header';
import { FormWrapper } from '../../shared/model/types';
import { ApiError, Http } from '../../shared/services/http';
import { Lang } from '../../shared/services/lang';
import { Loader } from '../../shared/services/loader';
import { ToastService } from '../../shared/services/toast-service';
import { FormLogic } from '../components/form-logic';
import { FormService } from '../services/form-service';

export class FormPage extends Page {
    content = document.createElement('div');
    pageContentContainer = document.createElement('div');
    pageTitle = document.createElement('h1');

    formService = FormService.getInstance();

    header: Header = new Header();
    footer: Footer = new Footer();

    formName: string = ''
    projectName: string = '';

    formWrapper: FormWrapper | undefined = undefined;
    form: Form | undefined;

    constructor() {
        super();

        
        const formNameUrlParam = Router.getUrlParameter('formName');
        if (formNameUrlParam) {
            this.formName = formNameUrlParam;

            this.setPageParameters({ 
                formName: this.formName,
                clientSessionId: this.parameters?.clientSessionId ? this.parameters.clientSessionId : crypto.randomUUID()
            });
        
            this.createContent();

            this.setTitle('Formulier');
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

    getForm(formName: string) {
        Loader.show();
        Http.get(`${Router.tenantPath}/api/forms/${formName}`, {})
            .then(formWrapper => {
                Loader.hide();
                this.initForm(formWrapper);
            })
            .catch(error => {
                Loader.hide();
                if (error instanceof ApiError) {
                    ToastService.error(Lang.get('error.check.fields'));
                }
            });
    }

    initForm(formWrapper: FormWrapper) {
        if (!formWrapper) {
            console.error('No fields found in the project details');
            return;
        }

        this.formWrapper = formWrapper;
        if (!this.formWrapper.form) {
            return;
        }

        if (this.formWrapper?.form?.label) {
            this.setTitle(this.formWrapper?.form?.label);
        }

        FormRenderer.createForm(this.formWrapper.form, this.parameters?.clientSessionId, {showSummary: true}).then(form => {
            this.form = form;

            this.pageContentContainer.append(this.form.getContent());
            this.formService.setForm(this.form);

            const fields = this.formService.getNucleus();

            // Logic that needs to be initialized after the form is loaded.
            // For example the showconditions
            for (let i=0; i < fields.length; i++) {
                fields[i].afterFormInit();
            }

            new FormLogic(this.form);

            const fileInputs = fields.filter(field => field.getType() === 'file') as FileUploadField[];
            for (const fileInput of fileInputs) {
                fileInput
                    .setClientSessionId(this.parameters?.clientSessionId)
                    .setUploadUrl(`${Router.tenantPath}/api/forms/${this.formName}/upload`)
                    .setDeleteUrl(`${Router.tenantPath}/api/forms/${this.formName}/delete`);
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
}
