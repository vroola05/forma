import { Footer } from '../../../shared/generic-components/footer';
import { Page } from '../../../shared/page-components/page';
import { EventService } from '../../../shared/services/event-service';
import { Storage } from '../../../shared/services/storage-service';
import { AdminHeader } from '../../component/admin-header';
import { BuilderForm } from '../../fields/builder-form';

import { ValidationError } from '../../../shared/errors/validation-error';
import { FormButton } from '../../../shared/form-components/components/form-button';
import { footerService } from '../../../shared/services/footer-service';
import { ApiError, ErrorType, Http } from '../../../shared/services/http';
import { Lang } from '../../../shared/services/lang';
import { Router } from '../../../shared/services/router';
import { ToastService } from '../../../shared/services/toast-service';

import { BaseFieldDto, FormWrapper } from '../../../shared/model/types';
import { Loader } from '../../../shared/services/loader';
import { BuilderFormServiceRegistry } from '../../services/builder-form-service';
import { BuilderPropertiesService } from '../../services/builder-properties-service';
import { FormVariables } from './components/forms/form-variables';


export class BuilderPage extends Page {
    routerOutlet = document.createElement('div');
    #builderFormService = BuilderFormServiceRegistry.get('builder-form');
    adminHeader: AdminHeader;
    footer: Footer;

    isLoaded = false;
    
    dropzone = null;
    acceptedTypes = ['tab'];

    constructor() {
        super();

        this.setTitle(Lang.get('builder.form.title'));

        this.adminHeader = new AdminHeader();
        this.footer = new Footer();
        this.content.classList.add('builder-page-content-container');
        this.content.append(this.adminHeader.getContent(), this.routerOutlet, this.footer.getContent());

        this.routerOutlet.className = 'page-router-outlet';
        
        this.attachSubView(this.routerOutlet);

        // Check if form name in session storage matches the one in the URL
        let formName = Storage.getPageItem('form-name');
        const formNameUrlParam = Router.getUrlParameter('formName');
        if (!formNameUrlParam) {
            return;
        }

        if (formName !== formNameUrlParam) {
                Storage.removePageItem('form-wrapper');
                Storage.setPageItem('form-name', formNameUrlParam);
                formName = formNameUrlParam;
        }

        const formWrapperString = Storage.getPageItem('form-wrapper');
        if (formWrapperString) {
            const formWrapper = JSON.parse(formWrapperString) as FormWrapper
            this.#builderFormService.setFormWrapper(formWrapper);
            this.init(this.#builderFormService.getFormWrapper());
        } else if (formName && formName !== 'new') {
            this.getForm(formNameUrlParam);
        } else {
            this.#builderFormService.setFormWrapper({active: true} as FormWrapper);
            this.init(this.#builderFormService.getFormWrapper());
        }

        this.setFooterButtons();
    }

    init(formWrapper: FormWrapper | undefined) {
        // Create the Builder form
        const builderForm = new BuilderForm();
        builderForm.init(formWrapper?.form as BaseFieldDto);
        this.#builderFormService.setBuilderForm(builderForm);

        // Create the Variables form
        const formVariables = new FormVariables()
        formVariables.createForm(formWrapper?.formConfig?.variables);

        this.isLoaded = true;
    }

    /**
     * 
     */
    afterInit() {
        EventService.addEventListener('value-changed', () => {
            this.updateForm();
        });

        EventService.addEventListener('field-changed', () => {
            this.updateForm();
        });

        EventService.addEventListener('field-deleted', () => {
            this.updateForm();
        });

        EventService.addEventListener('settings-changed', () => {
            Storage.setPageItem('form-wrapper', JSON.stringify(this.#builderFormService.getFormWrapper()));
        });
    }

    setFooterButtons() {
        footerService.addButtonRight(new FormButton(Lang.get('generic.btn.cancel'), 'footer-btn btn-secondary cancel', null, () => {
            Router.route('/admin/page/forms');
        }));
        footerService.addButtonRight(new FormButton(Lang.get('generic.btn.save'), 'footer-btn btn-primary save', null, () => {
            try {
                this.#builderFormService?.getBuilderForm()?.validate();
            } catch(error: unknown) {
                if (error instanceof ValidationError) {
                    ToastService.error(`${error.getPath()} - ${error.message}`);
                } else if (error instanceof Error) {
                    ToastService.error(error.message);
                } else {
                    ToastService.error(String(error));
                }
                
                return;
            }

            this.#builderFormService?.getForm('variables')?.validate();
            // this.postForm();
        }));
    }

    updateForm() {
        if (!this.isLoaded) {
            return;
        }
    
        try {
            const formWrapper = this.#builderFormService?.getFormWrapper();
            if (formWrapper){ 
                formWrapper.form = this.#builderFormService?.getBuilderForm()?.getData();
            }

            Storage.setPageItem('form-wrapper', JSON.stringify(this.#builderFormService.getFormWrapper()));
        } catch(error) {
            console.error(error);
        }
    }

    getForm(formName: string) {
        Loader.show();
        
        Http.get(`${Router.tenantPath}/api/form-builder/form/${formName}`, {})
            .then((formWrapper: FormWrapper) => {
                Loader.hide();
                if (!formWrapper) {
                    console.error('No fields found in the project details');
                    return;
                }

                formWrapper.formConfig ??= {};

                this.#builderFormService.setFormWrapper(formWrapper as FormWrapper);

                this.init(this.#builderFormService.getFormWrapper());
            })
            .catch(error => {
                Loader.hide();
                if (error instanceof ApiError) {
                    ToastService.error(error.message ? error.message : Lang.get('error.check.fields'));
                }
            });
    }

    postForm() {
        Loader.show();
        const formWrapper = this.#builderFormService.getFormWrapper();
        Http.post(`${Router.tenantPath}/api/form-builder/form`, formWrapper)
            .then(tab => {
                Loader.hide();
                if (!tab) {
                    console.error('No fields found in the project details');
                    return;
                }
                Router.route(Router.tenantPath + '/admin/page/forms');
            })
            .catch(error => {
                Loader.hide();
                ToastService.clear();
                
                if (error.type === ErrorType.VALIDATION) {
                    const builderForm = this.#builderFormService.getBuilderForm();
                    const errorList = builderForm?.handleValidationError(error.getDetails());
                    for (const error of errorList) {
                        
                        ToastService.error(
                            `<b>${error.builderFieldInterface.getFieldIdentifier()} - ${error.fieldProperty.label}:</b> 
                            ${error.errors.join(' ')}`
                            );

                        BuilderPropertiesService.set(error.builderFieldInterface, error);
                    }

                } else {
                    ToastService.error(Lang.get('error.check.fields'));
                }
            });
    }

    destroy() {
        super.destroy();

        footerService.clear();
        
        this.#builderFormService.setForm('variables', undefined);
        this.#builderFormService.setBuilderForm(undefined);
        this.#builderFormService.setFormWrapper(undefined);
        BuilderFormServiceRegistry.destroy('builder-form');
    }
}
