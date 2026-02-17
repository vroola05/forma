import { Page } from '../../shared/page-components/page.js';
import { BuilderForm } from '../fields/builder-form.js';
import { Dropzone } from '../fields/components/dropzone.js';
import { BuilderPropertyComponent } from '../properties/builder-properties-component.js';
import { EventService } from '../../shared/services/event-service.js';
import { FIELD_TYPES } from '../field-types.js'
import { FormButton } from '../../form-viewer/components/form-button.js';

import { Toaster } from '../../shared/generic-components/toaster.js';

import { ValidationError, Http } from '../../shared/services/http.js';
import { Lang } from '../../shared/services/lang.js';
import { Router } from '../../shared/services/router.js';

import { BuilderFormService } from '../services/builder-form-service.js';
import { AutocompleteField } from '../properties/components/autocomplete-field.js';

export class BuilderPage extends Page {
    content = document.createElement('div');
    builderPageContentContainer = document.createElement('div');
    builderPageMenuContainer = document.createElement('div');
    builderPageFormContainer = document.createElement('div');
    loader = document.querySelector('.loader');

    builderFields = [];

    dropzone = null;
    acceptedTypes = ['tab'];

    constructor() {
        super();

        this.setTitle('Ontwerp formulier');

        BuilderFormService.set(new BuilderForm());

        EventService.callEventListener('header-buttons-right', [
            new FormButton(Lang.get('generic.cancel'), 'cancel', null, () => {console.log('cancel')}),
            new FormButton(Lang.get('generic.save'), 'save', null, () => {
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
            })
        ], '');

        this.createContent();

        // Check if form name in session storage matches the one in the URL
        let formName = sessionStorage.getItem('form-name');
        if (Router.lastParams && 'formName' in Router.lastParams && Router.lastParams.formName) {
            const formNameStored = sessionStorage.getItem('form-name');
            if(formNameStored !== Router.lastParams.formName) {
                sessionStorage.removeItem('form-wrapper');
                sessionStorage.setItem('form-name', Router.lastParams.formName);
                formName = Router.lastParams.formName;
            }
        }

        const formWrapperString = sessionStorage.getItem('form-wrapper');
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
        BuilderFormService.get().init(formWrapper.form);
    }

    /**
     * 
     */
    afterInit() {
        // This is needed to ensure that the properties component is created after the page is fully initialized
        this.builderPropertiesComponent =  new BuilderPropertyComponent();
        this.builderPropertiesContainerWrapper.appendChild(this.builderPropertiesComponent.getContent());

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
    }

    createContent() {
        this.content.className = 'container-fluid mt-4 builder-page-wrapper';

        this.builderPageContentContainer.className = 'builder-page-content-container mt-5 ms-5 me-5 mb-3';
        this.content.append(this.builderPageContentContainer);

        const rowContainer = document.createElement('div');
        rowContainer.className = 'row';
        this.builderPageContentContainer.append(rowContainer);

        this.builderPageMenuContainer.className = 'builder-page-menu-container col col-3';
        rowContainer.append(this.builderPageMenuContainer);

        this.builderPageFormContainer.className = 'builder-page-form-container col col-6';
        rowContainer.append(this.builderPageFormContainer);

        this.builderPropertiesContainerWrapper = document.createElement('div');
        this.builderPropertiesContainerWrapper.className = 'builder-page-properties-container col col-3';
        rowContainer.append(this.builderPropertiesContainerWrapper);

        this.builderMenuUlContainer = document.createElement('ul');
        this.builderMenuUlContainer.className = 'list-group';
        this.builderPageMenuContainer.append(this.builderMenuUlContainer);

        Object.entries(FIELD_TYPES).forEach(([type, label]) => {
            this.createMenuItem(type, label);
        });
        
        this.builderPageFormContainer.appendChild(BuilderFormService.get().getContent());


        const sampleField = new AutocompleteField('sample-field', 'sample-field');
        this.builderPageFormContainer.appendChild(sampleField.getContent());
    }

    

    /**
     * 
     * @param {*} type 
     * @param {*} label 
     */
    createMenuItem(type, label) {
        const builderPageFieldMenuItem = document.createElement('li');
        builderPageFieldMenuItem.className = 'builder-page-field-menu-item list-group-item';
        builderPageFieldMenuItem.draggable = true;
        builderPageFieldMenuItem.innerHTML = label;
        builderPageFieldMenuItem.setAttribute('data-type', type);
        builderPageFieldMenuItem.setAttribute('data-label', label);
        this.builderMenuUlContainer.append(builderPageFieldMenuItem);
        builderPageFieldMenuItem.addEventListener("dragstart", (event) => {
            Dropzone.setDraggedItem(event.target);
        });
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
        try {
            this.formWrapper.form = BuilderFormService.get().getData();
            sessionStorage.setItem('form-wrapper', JSON.stringify(this.formWrapper));
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
