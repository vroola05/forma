import { Http } from '../../../shared/services/http';
import { Lang } from '../../../shared/services/lang';
import { Router } from '../../../shared/services/router';
import { SettingsPage } from '../settings-page';

import { FormButton } from '../../../shared/form-components/components/form-button';

import { FormDto, GroupRegisterRequestDto } from '../../../shared/model/types';
import { footerService } from '../../../shared/services/footer-service';

import { Form } from '../../../shared/form-components/form';
import { FormGroup } from '../../../shared/form-components/form-group';

export class GroupPageEdit extends SettingsPage {
    form: Form | null = null;
    group: GroupRegisterRequestDto = {};
    isNew = false;

    constructor() {
        super(Lang.get('group.new.title'));

        const id = Router.getUrlParameter('id') as string;
        this.isNew = id === 'new';


        Http.get(`${Router.tenantPath}/api/groups/permissions/list`)
            .then((permissions) => {
                if (this.isNew) {
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
        footerService.addButtonRight(new FormButton(Lang.get('generic.btn.cancel'), 'footer-btn btn-secondary cancel', null, () => { }));
        footerService.addButtonRight(new FormButton(Lang.get('generic.btn.save'), 'footer-btn btn-primary save', null, () => {
            this.save();
        }));
    }

    #getGroup(id: string, permissions: string[]) {
        Http.get(`${Router.tenantPath}/api/groups/${id}`)
            .then((group: GroupRegisterRequestDto) => {
                this.group = group;

                this.createContent(permissions);
            })
            .catch((error) => {
                console.error(error);
            });
    }

    createContent(permissions: string[]) {

        const formDto: FormDto = {
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
        };

        Form.create(formDto).then(form => {
            this.form = form;
            
            this.append(this.form.getContent());
        }).catch(() => {});

    }


    save() {
        if (!this.form || !this.group || (this.isNew && !this.group.id)) {
            return;
        }

        if (!this.form.validate()) {
            return;
        }

        const formGroup = this.form.getTabField('group-tab', 'group-group') as FormGroup;

        const permissions = formGroup.getField('permissions')?.getOptions().map(option => option.value);

        this.group.name = formGroup.getFieldValue('name');

        this.group.permissions = permissions;

        if (this.isNew) {
            this.post(formGroup);
        } else {
            this.put(formGroup);
        }
    }

    put(formGroup: FormGroup) {
        Http.put(`${Router.tenantPath}/api/groups/${this.group.id}`, this.group, {})
            .then((group) => {
                Router.route('/admin/page/groups');
            })
            .catch((error) => {

                const fieldErrors = error.getFields();
                formGroup.setBackendErrors(fieldErrors);
            });
    }

    post(formGroup: FormGroup) {
        Http.post(`${Router.tenantPath}/api/groups`, this.group, {})
            .then((group) => {
                Router.route('/admin/page/groups');
            })
            .catch((error) => {

                const fieldErrors = error.getFields();
                formGroup.setBackendErrors(fieldErrors);
            });
    }

    destroy() {
        super.destroy();

        footerService.clear();
    }
}
