import { SettingsPage } from '../settings-page.js';
import { Http } from '../../../shared/services/http.js';
import { Router } from '../../../shared/services/router.js';
import { Lang } from '../../../shared/services/lang.js';


import { TextField } from '../../../shared/form-components/text-field.js';
import { PasswordField } from '../../../shared/form-components/password-field.js';
import { FormButton } from '../../../shared/form-components/components/form-button.js';
import { AdminHeader } from '../../component/admin-header.js';
import { EventService } from '../../../shared/services/event-service.js';

import { footerService } from '../../../shared/services/footer-service.js';
import { UserRegisterRequest, USER_STATUS } from '../../../shared/model/form-data.js';

import { FormRenderer } from '../../../form-viewer/components/form-renderer.js';
import { Form } from '../../../shared/form-components/form.js';

export class UserPageEdit extends SettingsPage {
    isNew = false;

    constructor() {
        super('');

        const id = Router.getUrlParameter('id');
        
        this.isNew = id === 'new';
        this.setTitle(this.isNew ? Lang.get('user.new.title') : Lang.get('user.edit.title'));

        Http.get(`${Router.tenantPath}/api/groups/list`, {})
        .then((groups) => {
            this.groups = groups;

            if (this.isNew) {

                this.user = new UserRegisterRequest();
                this.createContent(groups);
                return;
            } else {
                this.#getUser(id, groups);
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

    #getUser(id, permissions) {
        Http.get(`${Router.tenantPath}/api/users/${id}`)
            .then((user) => {
                this.user = new UserRegisterRequest(user);
                console.log(this.user);
                this.createContent(permissions);
            })
            .catch((error) => {
                console.error(error);
            });
    }

    createContent(groups = []) {

        this.userForm = new Form({
            "id": "user-form",
            "name": "user-form",
            "label": Lang.get('user.new.title'),
            "type": "form",
            "singlePage": true,
            "fields": [
                {
                    "id": "user-tab",
                    "name": "user-tab",
                    "type": "tab",
                    "fields": [
                        {
                            "id": "user-group",
                            "name": "user-group",
                            "label": Lang.get('user.new.title'),
                            "type": "form-group",
                            "fields": [
                                {
                                    "name": "name",
                                    "label": Lang.get('generic.name'),
                                    "type": "text",
                                    "required": true,
                                    "value": this.user?.name
                                },
                                {
                                    "name": "username",
                                    "label": Lang.get('generic.username'),
                                    "type": "text",
                                    "required": true,
                                    "value": this.user?.username
                                },
                                {
                                    "name": "password",
                                    "label": Lang.get('generic.password'),
                                    "type": "password",
                                    "required": this.isNew
                                },
                                {
                                    "name": "email",
                                    "label": Lang.get('generic.email'),
                                    "type": "text",
                                    "required": true,
                                    "value": this.user?.email
                                },
                                {
                                    "name": "status",
                                    "label": Lang.get('generic.status'),
                                    "type": "select",
                                    "required": true,
                                    "options": Object.entries(USER_STATUS).map(([key, val_fnc]) => ({value: key, text: val_fnc()})),
                                    "value": this.user.status
                                },
                                {
                                    "name": "groups",
                                    "label": Lang.get('generic.groups'),
                                    "type": "dual-listbox",
                                    "required": false,
                                    "options": [
                                        ...groups.map(group => ({
                                            "value": group.id,
                                            "text": group.name
                                        }))
                                    ],
                                    "value": this.user?.groups?.map(group => ({
                                        "value": group.id,
                                        "text": group.name
                                    })) || []
                                }
                            ]
                        }
                    ]
                }
            ]
        });

        this.append(
            this.userForm.getContent()
        );
    }


    save() {
        if (!this.user || (!this.isNew && !this.user.id)) {
            return;
        }

        if (!this.userForm.validate()) {
            return;
        }

        const user = this.userForm.getTabField('user-tab', 'user-group');

        const groups = user.getField('groups').getOptions().map(option => option.value);
        const status = user.getFieldValue('status');

        this.user.name = user.getFieldValue('name');
        this.user.username = user.getFieldValue('username');
        this.user.password = user.getFieldValue('password');
        this.user.email = user.getFieldValue('email');
        this.user.status = status[0].value;

        this.user.groups = this.groups.filter(g => groups.includes(g.id));

        console.log(this.user);
        if (this.isNew) {
            this.post();
        } else {
            this.put();
        }
    }

    put() {
        Http.put(`${Router.tenantPath}/api/users/${this.user.id}`, this.user, {})
            .then((user) => {
                Router.route('/admin/page/users');
            })
            .catch((error) => {

                const fieldErrors = error.getFields();
                user.setBackendErrors(fieldErrors);
            });
    }

    post() {
        Http.post(`${Router.tenantPath}/api/users`, this.user, {})
            .then((user) => {
                Router.route('/admin/page/users');
            })
            .catch((error) => {

                const fieldErrors = error.getFields();
                this.userForm.getTabField('user-tab', 'user-group').setBackendErrors(fieldErrors);
            });
    }

}
