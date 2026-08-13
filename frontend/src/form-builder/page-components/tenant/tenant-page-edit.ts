import { Http } from '../../../shared/services/http';
import { Lang } from '../../../shared/services/lang';
import { Router } from '../../../shared/services/router';
import { SettingsPage } from '../settings-page';

import { FormButton } from '../../../shared/form-components/components/form-button';

import { Form } from '../../../shared/form-components/form';
import { FormGroup } from '../../../shared/form-components/form-group';
import { FileUploadField } from '../../../shared/form-components/upload-field';
import { FormDto, TENANT_STATUS, TenantDto } from '../../../shared/model/types';
import { footerService } from '../../../shared/services/footer-service';

export class TenantPageEdit extends SettingsPage {
    form: Form | null = null;
    tenant: TenantDto = {};

    constructor() {
        super(Lang.get('tenant.edit.title'));

        const slug = Router.getUrlParameter('slug');

        Http.get(`${Router.basePath}/${slug}/api/tenant`)
        .then((tenant) => {
            this.tenant = tenant;
            this.createContent(tenant);
        })
        .catch((error) => {
            console.error(error);
        });
    }

    createContent(tenant: TenantDto) {
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
                                    "value": tenant?.name
                                },
                                {
                                    "name": "slug",
                                    "label": Lang.get('tenant.field.slug'),
                                    "type": "text",
                                    "required": true,
                                    "value": tenant?.slug
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
                                    "value": tenant?.primaryColor
                                },
                                {
                                    "name": "secondary-color",
                                    "label": Lang.get('generic.secondary.color'),
                                    "type": "color",
                                    "value": tenant?.secondaryColor
                                },
                                {
                                    "name": "home-page",
                                    "label": Lang.get('tenant.field.home.page'),
                                    "type": "text",
                                    "value": tenant?.homePage
                                },
                                {
                                    "name": "status",
                                    "label": Lang.get('generic.status'),
                                    "type": "radio",
                                    "required": true,
                                    "options": Object.entries(TENANT_STATUS).map(([key, val_fnc]) => ({
                                        value: key, text: val_fnc()})),
                                    "value": !tenant?.status ? [] : [{value: tenant?.status, text: ''}]
                                },
                                {
                                    "name": "email",
                                    "label": Lang.get('generic.email'),
                                    "type": "email",
                                    "required": true,
                                    "value": tenant?.email
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
        }).catch(() => {});
    }


    putTenant() {
        if (!this.tenant || !this.tenant.id) {
            return;
        }

        if (!this.form?.validate()) {
            return;
        }

        const tenantGroup = this.form.getTabField('tenant-tab', 'tenant-group') as FormGroup;
        const userGroup = this.form.getTabField('tenant-tab', 'user-group') as FormGroup;

        const tenantStatus = tenantGroup.getFieldValue('status');
        
        this.tenant.name = tenantGroup.getFieldValue('name');
        this.tenant.slug = tenantGroup.getFieldValue('slug');
        this.tenant.homePage = tenantGroup.getFieldValue('home-page');
        this.tenant.primaryColor = tenantGroup.getFieldValue('primary-color');
        this.tenant.secondaryColor = tenantGroup.getFieldValue('secondary-color');
        this.tenant.status = tenantStatus[0].value;
        this.tenant.email = tenantGroup.getFieldValue('email');

        Http.put(`${Router.tenantSlug}/api/tenant/${this.tenant.id}`, this.tenant, {})
            .then((tendantNew) => {
                const logoField = tenantGroup.getField('logo') as FileUploadField;
                const logoFileInput = logoField.getFiles();
                
                if (!logoFileInput || logoFileInput.length === 0) {
                    Router.route('/admin/page/tenant');
                } else {
                    this.upload(logoFileInput);
                }
            })
            .catch((error) => {
                const fieldErrors = error.getFields();
                tenantGroup.setBackendErrors(fieldErrors);

                if (fieldErrors.has('tenantAdmin')) {
                    userGroup.setBackendErrors(fieldErrors.get('tenantAdmin'));
                }
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
                Router.route('/admin/page/tenant');
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
