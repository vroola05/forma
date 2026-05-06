import { Page } from '../../../shared/page-components/page.js';
import { BuilderForm } from '../../fields/builder-form.js';

import { EventService } from '../../../shared/services/event-service.js';

import { Storage } from '../../../shared/services/storage-service.js';

import { FormButton } from '../../../form-viewer/components/form-button.js';
import { footerService } from '../../../shared/services/footer-service.js';
import { Toaster } from '../../../shared/generic-components/toaster.js';


import { ValidationError, Http } from '../../../shared/services/http.js';
import { Lang } from '../../../shared/services/lang.js';
import { Router } from '../../../shared/services/router.js';

import { BuilderFormService } from '../../services/builder-form-service.js';
import { FormWrapper } from '../../../shared/model/form-data.js';


export class BuilderPage extends Page {
    
    content = document.createElement('div');
    

    loader = document.querySelector('.loader');
    isLoaded = false;
    builderChildFields = [];

    dropzone = null;
    acceptedTypes = ['tab'];

    constructor() {
        super();
        this.setTitle('Ontwerp formulier');

        console.log('BuilderPage');

        this.createContent();
        this.attachSubView(this.content);

        BuilderFormService.setBuilderForm(new BuilderForm());
        footerService.addButtonRight(new FormButton(Lang.get('generic.cancel'), 'footer-btn btn-secondary cancel', null, () => {console.log('cancel')}));
        footerService.addButtonRight(new FormButton(Lang.get('generic.save'), 'footer-btn btn-primary save', null, () => {
            try {
                BuilderFormService.getBuilderForm().validate();
            } catch(error) {
                Toaster.error(`${error.getPath()} - ${error.message}`);
                return;
            }

            const formWrapper = {
                form: BuilderFormService.getBuilderForm().getData(),
                active: true
            };

            this.postForm(formWrapper);

        }));

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
        } else if (formName) {
            this.getForm(formNameUrlParam);
        } else {
            BuilderFormService.setFormWrapper(new FormWrapper());
        }
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
            console.log(a);
        });
    }


    createContent() {
        // this.content = ;
    }

    updateForm() {
        if (!this.isLoaded) {
            return;
        }

        try {
            BuilderFormService.getFormWrapper().form = BuilderFormService.getBuilderForm().getData();
            Storage.setPageItem('form-wrapper', JSON.stringify(BuilderFormService.getFormWrapper()));

        } catch(error) {
            console.log(error);
        }
    }

    getForm(formName) {
        this.loader.classList.add('active');
        Http.get(`${Router.base}/api/form-builder/form/${formName}`, {})
            .then(formWrapperData => {
                this.loader.classList.remove('active');
                if (!formWrapperData) {
                    console.error('No fields found in the project details');
                    return;
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
}
