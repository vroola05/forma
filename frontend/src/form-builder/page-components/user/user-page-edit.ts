import { Http } from '../../../shared/services/http';
import { Lang } from '../../../shared/services/lang';
import { Router } from '../../../shared/services/router';
import { SettingsPage } from '../settings-page';


import { FormButton } from '../../../shared/form-components/components/form-button';

import { FormDto, GroupRegisterRequestDto, OptionDto, USER_STATUS, UserRegisterRequestDto } from '../../../shared/model/types';
import { footerService } from '../../../shared/services/footer-service';

import { Form } from '../../../shared/form-components/form';
import { FormGroup } from '../../../shared/form-components/form-group';

export class UserPageEdit extends SettingsPage {
    user: UserRegisterRequestDto = {}
    groups: GroupRegisterRequestDto[] | null = null;
    form: Form | null = null;
    isNew = false;

    constructor() {
        super('');

        const id = Router.getUrlParameter('id') as string;
        
        this.isNew = id === 'new';
        this.setTitle(this.isNew ? Lang.get('user.new.title') : Lang.get('user.edit.title'));

        Http.get(`${Router.tenantPath}/api/groups/list`, {})
        .then((groups) => {
            this.groups = groups;

            if (this.isNew) {

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
        footerService.addButtonRight(new FormButton(Lang.get('generic.btn.cancel'), 'footer-btn btn-secondary cancel', null, () => { }));
        footerService.addButtonRight(new FormButton(Lang.get('generic.btn.save'), 'footer-btn btn-primary save', null, () => {
            this.save();
        }));
    }

    #getUser(id: string, groups: GroupRegisterRequestDto[]) {
        Http.get(`${Router.tenantPath}/api/users/${id}`)
            .then((user: UserRegisterRequestDto) => {
                this.user = user;
                console.log(this.user);
                this.createContent(groups);
            })
            .catch((error) => {
                console.error(error);
            });
    }

    createContent(groups: GroupRegisterRequestDto[] = []) {

        const groupOptions = [
                        ...groups.map(group => ({
                            "value": group.id,
                            "text": group.name
                        }))
                    ] as OptionDto[];

                    const groupOptionValues = (this.user?.groups?.map(group => ({
                                        "value": group.id,
                                        "text": group.name
                                    })) || []) as OptionDto[];

        const formDto: FormDto = {
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
                                    "options": Object.entries(USER_STATUS).map(([key, val_fnc]) => ({
                                        value: key, text: val_fnc()
                                    })),
                                    "value": !this.user?.status ? [] : [{value: this.user.status, text: ''}]
                                },
                                {
                                    "name": "groups",
                                    "label": Lang.get('generic.groups'),
                                    "type": "dual-listbox",
                                    "required": false,
                                    "options": groupOptions,
                                    "value": groupOptionValues
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


    save() {
        if (!this.user || (!this.isNew && !this.user.id)) {
            return;
        }

        if (!this.form?.validate()) {
            return;
        }

        const userFormGroup = this.form.getTabField('user-tab', 'user-group') as FormGroup;

        const groups = userFormGroup.getField('groups')?.getOptions().map(option => option.value);
        const status = userFormGroup.getFieldValue('status');

        this.user.name = userFormGroup.getFieldValue('name');
        this.user.username = userFormGroup.getFieldValue('username');
        this.user.password = userFormGroup.getFieldValue('password');
        this.user.email = userFormGroup.getFieldValue('email');
        this.user.status = status[0].value;

        if (this.groups && groups) {
            this.user.groups = this.groups.filter(g => g.id && groups.includes(g.id));
        }

        if (this.isNew) {
            this.post(userFormGroup);
        } else {
            this.put(userFormGroup);
        }
    }

    put(userFormGroup: FormGroup) {
        Http.put(`${Router.tenantPath}/api/users/${this.user.id}`, this.user, {})
            .then((user) => {
                Router.route('/admin/page/users');
            })
            .catch((error) => {
                const fieldErrors = error.getFields();
                userFormGroup.setBackendErrors(fieldErrors);
            });
    }

    post(userFormGroup: FormGroup) {
        Http.post(`${Router.tenantPath}/api/users`, this.user, {})
            .then((user) => {
                Router.route('/admin/page/users');
            })
            .catch((error) => {
                const fieldErrors = error.getFields();
                userFormGroup.setBackendErrors(fieldErrors);
            });
    }

}
