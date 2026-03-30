import { Page } from '../../shared/page-components/page.js';
import { BuilderForm } from '../fields/builder-form.js';
import { BuilderPropertyComponent } from '../properties/builder-properties-component.js';
import { EventService } from '../../shared/services/event-service.js';

import { Storage } from '../../shared/services/storage-service.js';

import { FormButton } from '../../form-viewer/components/form-button.js';
import { footerService } from '../../shared/services/footer-service.js';
import { Toaster } from '../../shared/generic-components/toaster.js';

import { BuilderFieldItems } from '../component/builder-field-items.js';
import { ValidationError, Http } from '../../shared/services/http.js';
import { Lang } from '../../shared/services/lang.js';
import { Router } from '../../shared/services/router.js';

import { BuilderFormService } from '../services/builder-form-service.js';

export class BuilderPage extends Page {
    content = document.createElement('div');
    builderPageContentContainer = document.createElement('div');
    builderPageMenuLeftContainer = document.createElement('div');
    builderPageCenterContainer = document.createElement('div');
    loader = document.querySelector('.loader');
    isLoaded = false;
    builderFields = [];

    dropzone = null;
    acceptedTypes = ['tab'];

    constructor() {
        super();

        this.setTitle('Ontwerp formulier');

        BuilderFormService.set(new BuilderForm());
        footerService.addButtonRight(new FormButton(Lang.get('generic.cancel'), 'footer-btn btn-secondary cancel', null, () => {console.log('cancel')}));
        footerService.addButtonRight(new FormButton(Lang.get('generic.save'), 'footer-btn btn-primary save', null, () => {
            try {
                BuilderFormService.get().validate();
            } catch(error) {
                Toaster.error(error.message);
                return;
            }

            const formWrapper = {
                form: BuilderFormService.get().getData(),
                active: true
            };

            this.postForm(formWrapper);

        }));

        this.createContent();

        // Check if form name in session storage matches the one in the URL
        let formName = Storage.getPageItem('form-name');
        if (
            Router.lastParams 
            && 'formName' in Router.lastParams 
            && Router.lastParams.formName 
            && formName !== Router.lastParams.formName) {
                Storage.removePageItem('form-wrapper');
                Storage.setPageItem('form-name', Router.lastParams.formName);
                formName = Router.lastParams.formName;
        }

        const formWrapperString = Storage.getPageItem('form-wrapper');
        if (formWrapperString) {
            this.formWrapper = JSON.parse(formWrapperString);
            this.init(this.formWrapper);
        } else if (formName) {
            this.getForm(Router.lastParams.formName);
        } else {
            this.formWrapper = {
            };
        }

    }

    init(formWrapper) {
        console.log('Start init');
        BuilderFormService.get().init(formWrapper.form);
        console.log('End init');
        this.isLoaded = true;
    }

    /**
     * 
     */
    afterInit() {
        console.log('Start after init');
        // This is needed to ensure that the properties component is created after the page is fully initialized
        this.builderPropertiesComponent =  new BuilderPropertyComponent();
        this.builderPageMenuRightContainer.appendChild(this.builderPropertiesComponent.getContent());

        EventService.addEventListener('value-changed', (a, b) => {
            console.log('value changed');
            this.updateForm();
        });

        EventService.addEventListener('field-changed', (a, b) => {
            console.log('field changed');
            this.updateForm();
        });

        EventService.addEventListener('field-deleted', (a, b) => {
            console.log('field deleted');
            this.updateForm();
        });
        console.log('End after init');
    }

    createContent() {
        this.content.className = 'container-fluid mt-4 builder-page-wrapper';

        this.builderPageContentContainer.className = 'builder-page-content-container mt-5 ms-5 me-5 mb-3';
        this.content.append(this.builderPageContentContainer);

        const rowContainer = document.createElement('div');
        rowContainer.className = 'row';
        this.builderPageContentContainer.append(rowContainer);

        this.builderPageMenuLeftContainer.className = 'builder-page-menu-left-container col col-3';
        rowContainer.append(this.builderPageMenuLeftContainer);

        this.builderPageCenterContainer.className = 'builder-page-center-container col col-6';
        rowContainer.append(this.builderPageCenterContainer);

        this.builderPageMenuRightContainer = document.createElement('div');
        this.builderPageMenuRightContainer.className = 'builder-page-menu-right-container col col-3';
        rowContainer.append(this.builderPageMenuRightContainer);

        const builderFieldItems = new BuilderFieldItems('Basiscomponenten');
        builderFieldItems.createItems([
            {icon: 'icon-card-text', type: 'form-group', label: Lang.get('field.type.form.group')},
            {icon: 'icon-check-square', type: 'checkbox', label: Lang.get('field.type.checkbox')},
            {icon: 'icon-fonts', type: 'text', label: Lang.get('field.type.text')},
            {icon: 'icon-9-square', type: 'number', label: Lang.get('field.type.number')},
            {icon: 'icon-record-circle', type: 'radio', label: Lang.get('field.type.radio')},
            {icon: 'icon-card-list', type: 'select', label: Lang.get('field.type.select')},
            {icon: 'icon-calendar2-date', type: 'date', label: Lang.get('field.type.date')},
            {icon: 'icon-currency-euro', type: 'valuta', label: Lang.get('field.type.valuta')},
            {icon: 'icon-repeat', type: 'repeating-group', label: Lang.get('field.type.repeating.group')}
        ]);

        this.builderPageMenuLeftContainer.append(builderFieldItems.getContent());

        this.builderPageCenterContainer.appendChild(BuilderFormService.get().getContent());
    }

    /**
     * 
     * @param {*} formItemExisting 
     * @param {*} type 
     * @param {*} label 
     */
    addFormItem(formItemExisting, type, label) {
        this.updateForm();
    }

    /**
     * 
     * @param {*} formItemExisting 
     * @param {*} formItem 
     */
    moveFormItem(formItemOldPosition, formItemNewPosition) {
        this.updateForm();
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

    postForm(input) {
        this.loader.classList.add('active');
        Http.post(`${Router.base}/api/form-builder/form`, input)
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
