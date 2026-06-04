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

export class GroupPageNew extends SettingsPage {
    constructor() {
        super(Lang.get('group.new.title'));

        Http.get(`${Router.tenantPath}/api/groups/permissions/list`)
        .then((permissions) => {
            permissions;
            this.createContent(permissions);
        })
        .catch((error) => {
            console.error(error);
        });
    }

    createContent(permissions) {
        this.groupForm = new Form({
            "id": "group-form",
            "name": "group-form",
            "label": Lang.get('group.new.title'),
            "type": "form",
            "singlePage": true,
            "fields": [
                {
                    "id": "group-tab",
                    "name": "group-tab",
                    "type": "tab",
                    "fields": [
                        {
                            "id": "group-group",
                            "name": "group-group",
                            "label": Lang.get('group.new.title'),
                            "type": "form-group",
                            "fields": [
                                {
                                    "name": "name",
                                    "label": Lang.get('group.name'),
                                    "type": "text",
                                    "required": true
                                },
                                {
                                    "name": "permissions",
                                    "label": Lang.get('generic.permissions'),
                                    "type": "dual-listbox",
                                    "required": true,
                                    "options": [
                                        ...permissions.map(permission => ({
                                            "value": permission,
                                            "text": permission
                                        }))
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]   
        });

        this.append(
            this.groupForm.getContent()
        );
    }


    save() {
        if (!this.groupForm.validate()) {
            return;
        }

        const group = this.groupForm.getTabField('group-tab', 'group-group');

        console.log(group.getFieldValue('name'));
        console.log(group.getField('permissions').getOptions());

        Http.put(`${Router.basePath}/api/group/${this.group.id}`, this.group, {})
            .then((groupNew) => {
                
            })
            .catch((error) => {

                const fieldErrors = error.getFields();
                console.log(fieldErrors);
                group.setBackendErrors(fieldErrors);
            });

    }


    afterInit() {
        footerService.addButtonRight(new FormButton(Lang.get('generic.cancel'), 'footer-btn btn-secondary cancel', null, () => { }));
        footerService.addButtonRight(new FormButton(Lang.get('generic.save'), 'footer-btn btn-primary save', null, () => {
            this.save();
        }));
    }
}
