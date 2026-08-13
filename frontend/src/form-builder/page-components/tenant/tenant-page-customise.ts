import { SettingsPage } from '../settings-page';
import { Http } from '../../../shared/services/http';
import { Router } from '../../../shared/services/router';
import { Lang } from '../../../shared/services/lang';


import { FormButton } from '../../../shared/form-components/components/form-button';
import { TenantService } from '../../../shared/services/tenant-service';

import { footerService } from '../../../shared/services/footer-service';
import { FormDto, TenantDto } from '../../../shared/model/types';
import { Form } from '../../../shared/form-components/form';
import { FormGroup } from '../../../shared/form-components/form-group';
import { FileUploadField } from '../../../shared/form-components/upload-field';


export class TenantPageCustomise extends SettingsPage {
    form: Form | null = null;
    tenant: TenantDto = {};

    constructor() {
        super(Lang.get('tenant.edit.title'));

        if (TenantService.tenant) {
            this.tenant = TenantService.tenant;
        }
        
        this.createContent();
        
    }

    createContent() {
        const formDto: FormDto = {
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
                                    "type": "color",
                                    "value": this.tenant?.primaryColor
                                },
                                {
                                    "name": "secondary-color",
                                    "label": Lang.get('generic.secondary.color'),
                                    "type": "color",
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
                                    "value": !this.tenant?.status ? [] : [{value: this.tenant?.status, text: ''}]
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
        };

        Form.create(formDto).then(form => {
            this.form = form;
            this.append(this.form.getContent());
        });
    }


    putTenant() {
        if (!this.tenant || !this.tenant.id) {
            return;
        }

        if (!this.form?.validate()) {
            return;
        }

        const tenant: TenantDto = structuredClone(this.tenant);

        const tenantGroup = this.form.getTabField('tenant-tab', 'tenant-group') as FormGroup;

        const tenantStatus = tenantGroup.getFieldValue('status');
        
        tenant.name = tenantGroup.getFieldValue('name');
        tenant.slug = tenantGroup.getFieldValue('slug');
        tenant.homePage = tenantGroup.getFieldValue('home-page');
        tenant.primaryColor = tenantGroup.getFieldValue('primary-color');
        tenant.secondaryColor = tenantGroup.getFieldValue('secondary-color');
        tenant.status = tenantStatus[0].value;
        tenant.email = tenantGroup.getFieldValue('email');

        const logoField = tenantGroup.getField('logo') as FileUploadField;
        const logoFileInput = logoField.getFiles();
        
        Http.put(`${Router.tenantSlug}/api/tenant/${tenant.id}/customise`, tenant, {})
            .then((tendantNew) => {
                
                
                
                if (!logoFileInput || logoFileInput.length === 0) {
                    Router.home();
                }
                this.upload(logoFileInput);
            })
            .catch((error) => {

                const fieldErrors = error.getFields();
                tenantGroup.setBackendErrors(fieldErrors);
            });
    }

    upload(logoFileInput: (File | undefined)[]) {
        if (!logoFileInput || logoFileInput.length === 0) {
            return;
        }

        const file = logoFileInput[0];

        if (!file) {
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        
        Http.patch(`${Router.basePath}/${this.tenant.slug}/api/tenant/logo`, formData, {})
            .then((tendantNew) => {
                Router.home();
            })
            .catch((error) => {
                console.log(error);
            });
    }

    afterInit() {
        footerService.addButtonRight(new FormButton(Lang.get('generic.btn.cancel'), 'footer-btn btn-secondary cancel', null, () => { }));
        footerService.addButtonRight(new FormButton(Lang.get('generic.btn.save'), 'footer-btn btn-primary save', null, () => {
            this.putTenant();
        }));
    }

    destroy() {
        super.destroy();

        footerService.clear();
    }
}
