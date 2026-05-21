import { Page } from '../../../shared/page-components/page.js';
import { BuilderForm } from '../../fields/builder-form.js';
import { AdminHeader } from '../../component/admin-header.js';
import { Footer } from '../../../shared/generic-components/footer.js';
import { EventService } from '../../../shared/services/event-service.js';

import { Storage } from '../../../shared/services/storage-service.js';

import { FormButton } from '../../../shared/form-components/components/form-button.js';
import { footerService } from '../../../shared/services/footer-service.js';
import { Toaster } from '../../../shared/generic-components/toaster.js';

import { ValidationError, Http } from '../../../shared/services/http.js';
import { Lang } from '../../../shared/services/lang.js';
import { Router } from '../../../shared/services/router.js';

import { BuilderFormService } from '../../services/builder-form-service.js';
import { FormWrapper, FormConfig } from '../../../shared/model/form-data.js';


export class BuilderPage extends Page {
    routerOutlet = document.createElement('div');
    

    loader = document.querySelector('.loader');
    isLoaded = false;
    builderChildFields = [];

    dropzone = null;
    acceptedTypes = ['tab'];

    constructor() {
        super();

        this.setTitle('Ontwerp formulier');

        this.adminHeader = new AdminHeader();

        this.footer = new Footer();

        this.content.append(this.adminHeader.getContent(), this.routerOutlet, this.footer.getContent());

        this.attachSubView(this.routerOutlet);

        BuilderFormService.setBuilderForm(new BuilderForm());
    
        // Check if form name in session storage matches the one in the URL
        let formName = Storage.getPageItem('form-name');
        const formNameUrlParam = Router.getUrlParameter('formName');
        
        if (formNameUrlParam 
            && formName !== formNameUrlParam) {
                Storage.removePageItem('form-wrapper');
                Storage.setPageItem('form-name', formNameUrlParam);
                formName = formNameUrlParam;
        }

        const formWrapperString = Storage.getPageItem('form-wrapper');
        if (formWrapperString) {
            BuilderFormService.setFormWrapper(new FormWrapper(JSON.parse(formWrapperString)));
            this.init(BuilderFormService.getFormWrapper());
        } else if (formName && formName !== 'new') {
            this.getForm(formNameUrlParam);
        } else {
            BuilderFormService.setFormWrapper(new FormWrapper());
            this.init(BuilderFormService.getFormWrapper());
        }

        this.setFooterButtons();
    }

    init(formWrapper) {
        BuilderFormService.getBuilderForm().init(formWrapper.form);
        this.isLoaded = true;
    }

    /**
     * 
     */
    afterInit() {
        EventService.addEventListener('value-changed', (a, b) => {
            this.updateForm();
        });

        EventService.addEventListener('field-changed', (a, b) => {
            this.updateForm();
        });

        EventService.addEventListener('field-deleted', (a, b) => {
            this.updateForm();
        });

        EventService.addEventListener('settings-changed', (a, b) => {
            Storage.setPageItem('form-wrapper', JSON.stringify(BuilderFormService.getFormWrapper()));
        });
    }

    setFooterButtons() {
        footerService.addButtonRight(new FormButton(Lang.get('generic.cancel'), 'footer-btn btn-secondary cancel', null, () => {
            Router.route('/admin/page/forms');
        }));
        footerService.addButtonRight(new FormButton(Lang.get('generic.save'), 'footer-btn btn-primary save', null, () => {
            try {
                BuilderFormService.getBuilderForm().validate();
            } catch(error) {
                Toaster.error(`${error.getPath()} - ${error.message}`);
                return;
            }

            this.postForm();

        }));
    }

    updateForm() {
        if (!this.isLoaded) {
            return;
        }

        try {
            BuilderFormService.getFormWrapper().form = BuilderFormService.getBuilderForm().getData();
            console.log('Form wrapper updated', BuilderFormService.getFormWrapper());
            Storage.setPageItem('form-wrapper', JSON.stringify(BuilderFormService.getFormWrapper()));
        } catch(error) {
            console.log(error);
        }
    }

    getForm(formName) {
        this.loader.classList.add('active');
        Http.get(`${Router.tenantPath}/api/form-builder/form/${formName}`, {})
            .then(formWrapperData => {
                this.loader.classList.remove('active');
                if (!formWrapperData) {
                    console.error('No fields found in the project details');
                    return;
                }

                if (!formWrapperData?.formConfig) {
                    formWrapperData.formConfig = new FormConfig();
                }

                BuilderFormService.setFormWrapper(new FormWrapper(formWrapperData));

                this.init(BuilderFormService.getFormWrapper());
            })
            .catch(error => {
                this.loader.classList.remove('active');
                if (error instanceof ValidationError) {
                    Toaster.error(Lang.get('error.check.fields'));
                }
            });
    }

    postForm() {
        this.loader.classList.add('active');
        const formWrapper = BuilderFormService.getFormWrapper();
        formWrapper.active = true; // Set form as active when saving, can be changed in settings after saving
        Http.post(`${Router.tenantPath}/api/form-builder/form`, formWrapper)
            .then(tab => {
                this.loader.classList.remove('active');
                if (!tab) {
                    console.error('No fields found in the project details');
                    return;
                }
                Router.route('/');
            })
            .catch(error => {
                this.loader.classList.remove('active');
                console.log(error);
                if (error instanceof ValidationError) {
                    Toaster.error(Lang.get('error.check.fields'));
                }
            });
    }
}
