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
import { GroupRegisterRequest } from '../../../shared/model/form-data.js';

import { FormRenderer } from '../../../form-viewer/components/form-renderer.js';
import { Form } from '../../../shared/form-components/form.js';

export class GroupPageEdit extends SettingsPage {
    isNew = false;

    constructor() {
        super(Lang.get('group.new.title'));

        const id = Router.getUrlParameter('id');
        this.isNew = id === 'new';


        Http.get(`${Router.tenantPath}/api/groups/permissions/list`)
            .then((permissions) => {

                if (this.isNew) {
                    this.group = new GroupRegisterRequest();
                    this.createContent(permissions);
                    return;
                } else {
                    this.#getGroup(id, permissions);
                }



            })
            .catch((error) => {
                console.error(error);
            });
    }

    afterInit() {
        footerService.addButtonRight(new FormButton(Lang.get('generic.cancel'), 'footer-btn btn-secondary cancel', null, () => { }));
        footerService.addButtonRight(new FormButton(Lang.get('generic.save'), 'footer-btn btn-primary save', null, () => {
            this.save();
        }));
    }

    #getGroup(id, permissions) {
        Http.get(`${Router.tenantPath}/api/groups/${id}`)
            .then((group) => {
                this.group = new GroupRegisterRequest(group);

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
                                    "required": true,
                                    "value": this.group?.name
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
                                    ],
                                    "value": this.group?.permissions?.map(permission => ({
                                        "value": permission,
                                        "text": permission
                                    })) || []
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
        if (!this.group || (this.isNew && !this.group.id)) {
            return;
        }

        if (!this.groupForm.validate()) {
            return;
        }

        const group = this.groupForm.getTabField('group-tab', 'group-group');

        const permissions = group.getField('permissions').getOptions().map(option => option.value);

        this.group.name = group.getFieldValue('name');

        this.group.permissions = permissions;

        console.log(this.group);
        if (this.isNew) {
            this.post();
        } else {
            this.put();
        }
    }

    put() {
        Http.put(`${Router.tenantPath}/api/groups/${this.group.id}`, this.group, {})
            .then((group) => {
                Router.route('/admin/page/groups');
            })
            .catch((error) => {

                const fieldErrors = error.getFields();
                group.setBackendErrors(fieldErrors);
            });
    }

    post() {
        Http.post(`${Router.tenantPath}/api/groups`, this.group, {})
            .then((group) => {
                Router.route('/admin/page/groups');
            })
            .catch((error) => {

                const fieldErrors = error.getFields();
                group.setBackendErrors(fieldErrors);
            });
    }

}
