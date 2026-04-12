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

        

        this.createContent();
        this.attachSubView(this.content);

        BuilderFormService.set(new BuilderForm());
        footerService.addButtonRight(new FormButton(Lang.get('generic.cancel'), 'footer-btn btn-secondary cancel', null, () => {console.log('cancel')}));
        footerService.addButtonRight(new FormButton(Lang.get('generic.save'), 'footer-btn btn-primary save', null, () => {
            try {
                BuilderFormService.get().validate();
            } catch(error) {
                Toaster.error(`${error.getPath()} - ${error.message}`);
                return;
            }

            const formWrapper = {
                form: BuilderFormService.get().getData(),
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
            this.formWrapper = JSON.parse(formWrapperString);
            this.init(this.formWrapper);
        } else if (formName) {
            this.getForm(formNameUrlParam);
        } else {
            this.formWrapper = {
            };
        }
    }

    init(formWrapper) {
        console.log('Start init builder-page');
        BuilderFormService.get().init(formWrapper.form);
        console.log('End init builder-page');
        this.isLoaded = true;
    }

    /**
     * 
     */
    afterInit() {
        console.log('Start after init builder-page');
        // This is needed to ensure that the properties component is created after the page is fully initialized

        EventService.addEventListener('value-changed', (a, b) => {
            this.updateForm();
        });

        EventService.addEventListener('field-changed', (a, b) => {
            this.updateForm();
        });

        EventService.addEventListener('field-deleted', (a, b) => {
            this.updateForm();
        });
        console.log('End after init builder-page');
    }


    createContent() {
        // this.content = ;
    }

    updateForm() {
        if (!this.isLoaded) {
            return;
        }

        try {
            this.formWrapper.form = BuilderFormService.get().getData();
            Storage.setPageItem('form-wrapper', JSON.stringify(this.formWrapper));
        } catch(error) {
            console.log(error);
        }
    }

    getForm(formName) {
        this.loader.classList.add('active');
        Http.get(`${Router.base}/api/form-builder/form/${formName}`, {})
            .then(formWrapper => {
                this.loader.classList.remove('active');
                if (!formWrapper) {
                    console.error('No fields found in the project details');
                    return;
                }
                
                this.formWrapper = formWrapper;
                this.init(formWrapper);
            })
            .catch(error => {
                this.loader.classList.remove('active');
                if (error instanceof ValidationError) {
                    Toaster.error(Lang.get('error.check.fields'));
                }
            });
    }
}
