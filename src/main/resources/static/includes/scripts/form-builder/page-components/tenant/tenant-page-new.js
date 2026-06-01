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

import { footerService } from '../../../shared/services/footer-service.js';
import { Tenant, User } from '../../../shared/model/form-data.js';
import { RadioField } from '../../../shared/form-components/radio-field.js';
import { FileUploadField } from '../../../shared/form-components/upload-field.js';
import { FormRenderer } from '../../../form-viewer/components/form-renderer.js';
import { Form } from '../../../shared/form-components/form.js';

export class TenantPageNew extends SettingsPage {
    constructor() {
        super(Lang.get('tenant.new.title'));
        this.createContent();
    }

    createContent() {
        this.tenantForm = new Form({
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
        });

        this.append(
            this.tenantForm.getContent()
        );
    }

    postTenant() {
        // if (!this.tenantForm.validate()) {
        //     return;
        // }

        const tenantGroup = this.tenantForm.getTabField('tenant-tab', 'tenant-group');
        const userGroup = this.tenantForm.getTabField('tenant-tab', 'user-group');

        
        
        const tenant = new Tenant({
            name: tenantGroup.getFieldValue('name'),
            slug: tenantGroup.getFieldValue('slug'),
            homePage: tenantGroup.getFieldValue('home-page'),
            status: tenantGroup.getFieldValue('status'),
            email: tenantGroup.getFieldValue('email')
        });

        tenant.setTenantAdmin(new User({
            name: userGroup.getFieldValue('name'),
            username: userGroup.getFieldValue('username'),
            password: userGroup.getFieldValue('password'),
            email: userGroup.getFieldValue('email'),
        }));

        console.log(tenant);

        Http.post(`${Router.tenantSlug}/api/tenant`, tenant, {})
            .then((tendantNew) => {
                console.log(tendantNew);
                // this.upload();
            })
            .catch((error) => {

                const fieldErrors = error.getFields();
                console.log(fieldErrors);
                tenantGroup.setBackendErrors(fieldErrors);

                if (fieldErrors.has('tenantAdmin')) {
                    userGroup.setBackendErrors(fieldErrors.get('tenantAdmin'));
                }
            });

    }

    upload() {
        Http.post(`${Router.basePath}/${this.name.getValue()}/api/tenant/logo`, tenant, {})
            .then((tendantNew) => {
                console.log(tendantNew);
            })
            .catch((error) => {
                console.log(error);
            });
    }

    afterInit() {
        footerService.addButtonRight(new FormButton(Lang.get('generic.cancel'), 'footer-btn btn-secondary cancel', null, () => { }));
        footerService.addButtonRight(new FormButton(Lang.get('generic.save'), 'footer-btn btn-primary save', null, () => {
            this.postTenant();
        }));
    }
}
