import { Http } from '../../../shared/services/http';
import { Lang } from '../../../shared/services/lang';
import { Router } from '../../../shared/services/router';
import { SettingsPage } from '../settings-page';

import { FormButton } from '../../../shared/form-components/components/form-button';

import { Form } from '../../../shared/form-components/form';
import { FormGroup } from '../../../shared/form-components/form-group';
import { FileUploadField } from '../../../shared/form-components/upload-field';
import { FormDto, TenantDto } from '../../../shared/model/types';
import { footerService } from '../../../shared/services/footer-service';

export class TenantPageNew extends SettingsPage {
    form: Form | undefined;
    tenant: TenantDto = {};

    constructor() {
        super(Lang.get('tenant.new.title'));

        const formDto: FormDto = {
            "id": "tenant-form",
            "name": "tenant-form",
            "label": Lang.get('tenant.new.title'),
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
                            "label": Lang.get('tenant.new.title'),
                            "type": "form-group",
                            "fields": [
                                {
                                    "name": "name",
                                    "label": Lang.get('tenant.field.name'),
                                    "type": "text",
                                    "required": true
                                },
                                {
                                    "name": "slug",
                                    "label": Lang.get('tenant.field.slug'),
                                    "type": "text",
                                    "required": true
                                },
                                {
                                    "name": "logo",
                                    "label": Lang.get('tenant.field.logo'),
                                    "type": "file",
                                },
                                {
                                    "name": "primary-color",
                                    "label": Lang.get('generic.primary.color'),
                                    "type": "color"
                                },
                                {
                                    "name": "secondary-color",
                                    "label": Lang.get('generic.secondary.color'),
                                    "type": "color"
                                },
                                {
                                    "name": "home-page",
                                    "label": Lang.get('tenant.field.home.page'),
                                    "type": "text",
                                },
                                {
                                    "name": "status",
                                    "label": Lang.get('generic.status'),
                                    "type": "radio",
                                    "required": true,
                                    "options": [
                                        { 'value': 'ACTIVE', 'text': Lang.get('generic.status.active') },
                                        { 'value': 'SUSPENDED', 'text': Lang.get('generic.status.suspended') },
                                        { 'value': 'PENDING_DELETION', 'text': Lang.get('generic.status.pending.deletion') }
                                    ]
                                },
                                {
                                    "name": "email",
                                    "label": Lang.get('generic.email'),
                                    "type": "email",
                                    "required": true
                                }
                            ]
                        },
                        {
                            "id": "user-group",
                            "name": "user-group",
                            "label": Lang.get('generic.role.tenant.admin'),
                            "type": "form-group",
                            "fields": [
                                {
                                    "name": "name",
                                    "label": Lang.get('generic.name'),
                                    "type": "text",
                                    "required": true
                                },
                                {
                                    "name": "username",
                                    "label": Lang.get('generic.username'),
                                    "type": "text",
                                    "required": true
                                },
                                {
                                    "name": "password",
                                    "label": Lang.get('generic.password'),
                                    "type": "password",
                                    "required": true
                                },
                                {
                                    "name": "email",
                                    "label": Lang.get('generic.email'),
                                    "type": "email",
                                    "required": true
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

    postTenant() {
        if (!this.form || !this.form.validate()) {
            return;
        }
        console.log('aaaaaaaaaaaaaaaaa');
        const tenantGroup = this.form.getTabField('tenant-tab', 'tenant-group') as FormGroup;
        const userGroup = this.form.getTabField('tenant-tab', 'user-group') as FormGroup;

        const tenantStatus = tenantGroup.getFieldValue('status');        
        
        this.tenant = {
            name: tenantGroup.getFieldValue('name'),
            slug: tenantGroup.getFieldValue('slug'),
            homePage: tenantGroup.getFieldValue('home-page'),
            primaryColor: tenantGroup.getFieldValue('primary-color'),
            secondaryColor: tenantGroup.getFieldValue('secondary-color'),
            status: tenantStatus[0].value,
            email: tenantGroup.getFieldValue('email')
        };

        this.tenant.tenantAdmin = {
            name: userGroup.getFieldValue('name'),
            username: userGroup.getFieldValue('username'),
            password: userGroup.getFieldValue('password'),
            email: userGroup.getFieldValue('email'),
        };

        Http.post(`${Router.tenantSlug}/api/tenant`, this.tenant, {})
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
            });
    }

    afterInit() {
        footerService.addButtonRight(new FormButton(Lang.get('generic.btn.cancel'), 'footer-btn btn-secondary cancel', null, () => { }));
        footerService.addButtonRight(new FormButton(Lang.get('generic.btn.save'), 'footer-btn btn-primary save', null, () => {
            this.postTenant();
        }));
    }

    destroy() {
        super.destroy();

        footerService.clear();
    }
}
