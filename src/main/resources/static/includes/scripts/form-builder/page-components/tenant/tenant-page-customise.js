import { SettingsPage } from '../settings-page.js';
import { Http } from '../../../shared/services/http.js';
import { Router } from '../../../shared/services/router.js';
import { Lang } from '../../../shared/services/lang.js';


import { FormGroup } from '../../../shared/form-components/form-group.js';
import { TextField } from '../../../shared/form-components/text-field.js';
import { PasswordField } from '../../../shared/form-components/password-field.js';
import { FormButton } from '../../../shared/form-components/components/form-button.js';
import { AdminHeader } from '../../component/admin-header.js';
import { EventService } from '../../../shared/services/event-service.js';
import { TenantService } from '../../../shared/services/tenant-service.js';

import { footerService } from '../../../shared/services/footer-service.js';
import { Tenant, User } from '../../../shared/model/form-data.js';
import { RadioField } from '../../../shared/form-components/radio-field.js';
import { FileUploadField } from '../../../shared/form-components/upload-field.js';
import { FormRenderer } from '../../../form-viewer/components/form-renderer.js';
import { Form } from '../../../shared/form-components/form.js';


export class TenantPageCustomise extends SettingsPage {
    constructor() {
        super(Lang.get('tenant.edit.title'));

        this.tenant = TenantService.tenant;
        
        this.createContent();
        
    }

    createContent() {
        this.tenantForm = new Form({
            "id": "tenant-form",
            "name": "tenant-form",
            "label": Lang.get('tenant.edit.title'),
            "type": "form",
            "singlePage": true,
            "fields": [
                {
                    "id": "tenant-tab",
                    "name": "tenant-tab",
                    "type": "tab",
                    "fields": [
                        {
                            "id": "tenant-group",
                            "name": "tenant-group",
                            "label": Lang.get('tenant.edit.title'),
                            "type": "form-group",
                            "fields": [
                                {
                                    "name": "name",
                                    "label": Lang.get('tenant.field.name'),
                                    "type": "text",
                                    "required": true,
                                    "value": this.tenant?.name
                                },
                                {
                                    "name": "slug",
                                    "label": Lang.get('tenant.field.slug'),
                                    "type": "text",
                                    "required": true,
                                    "readonly": true,
                                    "value": this.tenant?.slug
                                },
                                {
                                    "name": "logo",
                                    "label": Lang.get('tenant.field.logo'),
                                    "type": "file",
                                },
                                {
                                    "name": "primary-color",
                                    "label": Lang.get('generic.primary.color'),
                                    "type": "color-field",
                                    "value": this.tenant?.primaryColor
                                },
                                {
                                    "name": "secondary-color",
                                    "label": Lang.get('generic.secondary.color'),
                                    "type": "color-field",
                                    "value": this.tenant?.secondaryColor
                                },
                                {
                                    "name": "home-page",
                                    "label": Lang.get('tenant.field.home.page'),
                                    "type": "text",
                                    "value": this.tenant?.homePage
                                },
                                {
                                    "name": "status",
                                    "label": Lang.get('generic.status'),
                                    "type": "radio",
                                    "required": true,
                                    "readonly": true,
                                    "options": [
                                        { 'value': 'ACTIVE', 'text': Lang.get('generic.status.active') },
                                        { 'value': 'SUSPENDED', 'text': Lang.get('generic.status.suspended') },
                                        { 'value': 'PENDING_DELETION', 'text': Lang.get('generic.status.pending.deletion') }
                                    ],
                                    "value": this.tenant?.status
                                },
                                {
                                    "name": "email",
                                    "label": Lang.get('generic.email'),
                                    "type": "email",
                                    "required": true,
                                    "value": this.tenant?.email
                                }
                            ]
                        }
                    ]
                }
            ]   
        });

        this.append(
            this.tenantForm.getContent()
        );
    }


    putTenant() {
        if (!this.tenant && !this.tenant.id) {
            return;
        }

        if (!this.tenantForm.validate()) {
            return;
        }

        const tenant = new Tenant(this.tenant);

        const tenantGroup = this.tenantForm.getTabField('tenant-tab', 'tenant-group');

        const tenantStatus = tenantGroup.getFieldValue('status');
        
        tenant.name = tenantGroup.getFieldValue('name');
        tenant.slug = tenantGroup.getFieldValue('slug');
        tenant.homePage = tenantGroup.getFieldValue('home-page');
        tenant.primaryColor = tenantGroup.getFieldValue('primary-color');
        tenant.secondaryColor = tenantGroup.getFieldValue('secondary-color');
        tenant.status = tenantStatus[0].value;
        tenant.email = tenantGroup.getFieldValue('email');

        Http.put(`${Router.tenantSlug}/api/tenant/${tenant.id}/customise`, tenant, {})
            .then((tendantNew) => {
                
                const logoFileInput = tenantGroup.getFieldValue('logo');
                
                if (!logoFileInput || logoFileInput.length === 0) {
                    Router.home();
                }
                this.upload(logoFileInput);
            })
            .catch((error) => {

                const fieldErrors = error.getFields();
                tenantGroup.setBackendErrors(fieldErrors);

                if (fieldErrors.has('tenantAdmin')) {
                    userGroup.setBackendErrors(fieldErrors.get('tenantAdmin'));
                }
            });
    }

    upload(logoFileInput) {
        
        if (!logoFileInput || logoFileInput.length === 0) {
            return;
        }

        const formData = new FormData();
        formData.append('file', logoFileInput[0]);
        
        Http.patch(`${Router.basePath}/${this.tenant.slug}/api/tenant/logo`, formData, {})
            .then((tendantNew) => {
                Router.home();
            })
            .catch((error) => {
                console.log(error);
            });
    }

    afterInit() {
        footerService.addButtonRight(new FormButton(Lang.get('generic.cancel'), 'footer-btn btn-secondary cancel', null, () => { }));
        footerService.addButtonRight(new FormButton(Lang.get('generic.save'), 'footer-btn btn-primary save', null, () => {
            this.putTenant();
        }));
    }
}
