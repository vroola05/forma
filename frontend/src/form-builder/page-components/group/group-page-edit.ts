import { Http } from '../../../shared/services/http';
import { Lang } from '../../../shared/services/lang';
import { Router } from '../../../shared/services/router';
import { SettingsPage } from '../settings-page';

import { FormButton } from '../../../shared/form-components/components/form-button';

import { FormDto, GroupRegisterRequestDto } from '../../../shared/model/types';
import { footerService } from '../../../shared/services/footer-service';

import { Form } from '../../../shared/form-components/form';
import { FormGroup } from '../../../shared/form-components/form-group';
import { threadId } from 'worker_threads';

export class GroupPageEdit extends SettingsPage {
    form: Form | null = null;
    group?: GroupRegisterRequestDto;
    isNew = false;

    constructor() {
        super(Lang.get('group.new.title'));

        const id = Router.getUrlParameter('id') as string;
        this.isNew = id === 'new';

        void this.createContent(id);
    }

    afterInit() {
        footerService.addButtonRight(new FormButton(Lang.get('generic.btn.cancel'), 'footer-btn btn-secondary cancel', null, () => { }));
        footerService.addButtonRight(new FormButton(Lang.get('generic.btn.save'), 'footer-btn btn-primary save', null, () => {
            this.save();
        }));
    }

    async createContent(id: string) {
        const permissions: string[] = await Http.get(`${Router.tenantPath}/api/groups/permissions/list`);

        if (!this.isNew) {
            this.group = await Http.get(`${Router.tenantPath}/api/groups/${id}`);
        }

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
                                    "values": this.group?.permissions?.map(permission => ({
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
        if (!this.form || (!this.group && !this.isNew) || (this.isNew && this.group)) {
            return;
        }

        if (!this.form.validate()) {
            return;
        }

        const formGroup = this.form.getTabField('group-tab', 'group-group') as FormGroup;
        const permissions = formGroup.getField('permissions')?.getOptions().map(option => option.value);

        const group: GroupRegisterRequestDto = {
            id: this.group?.id,
            name: formGroup.getFieldValue('name'),
            permissions: permissions
        }

        if (this.isNew) {
            this.post(formGroup, group);
        } else {
            this.put(formGroup, group);
        }
    }

    put(formGroup: FormGroup, group: GroupRegisterRequestDto) {
        Http.put(`${Router.tenantPath}/api/groups/${group.id}`, group, {})
            .then((group) => {
                Router.route('/admin/page/groups');
            })
            .catch((error) => {

                const fieldErrors = error.getFields();
                formGroup.setBackendErrors(fieldErrors);
            });
    }

    post(formGroup: FormGroup, group: GroupRegisterRequestDto) {
        Http.post(`${Router.tenantPath}/api/groups`, group, {})
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
