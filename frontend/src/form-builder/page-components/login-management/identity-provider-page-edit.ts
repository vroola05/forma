import { Lang } from '../../../shared/services/lang';
import { Router } from '../../../shared/services/router';
import { SettingsPage } from '../settings-page';

import { FormButton } from '../../../shared/form-components/components/form-button';

import { FieldDto, FormDto, GroupRegisterRequestDto, OptionDto, ProviderType, TenantAuthProviderDto, TenantAuthProviderGroupDtp } from '../../../shared/model/types';
import { footerService } from '../../../shared/services/footer-service';

import { Form } from '../../../shared/form-components/form';
import { FormGroup } from '../../../shared/form-components/form-group';
import { RadioField } from '../../../shared/form-components/radio-field';
import { RepeatingGroup } from '../../../shared/form-components/repeating-group';
import { SelectField } from '../../../shared/form-components/select-field';
import { TextField } from '../../../shared/form-components/text-field';
import { Http } from '../../../shared/services/http';

export class IdentityProviderPageEdit extends SettingsPage {
    form: Form | null = null;
    group: GroupRegisterRequestDto = {};
    isNew = false;

    constructor() {
        super(Lang.get('idp.title'));

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
        let authProviderDto: TenantAuthProviderDto | undefined = undefined;

        if (!this.isNew) {
            authProviderDto = await Http.get(`${Router.tenantPath}/api/idp/${id}`);
        }

        const groupDto: GroupRegisterRequestDto[] = await Http.get(`${Router.tenantPath}/api/groups/list`);
        console.log(groupDto);
        const formDto: FormDto = {
            "name": "idp-form",
            "label": 'IDP',
            "type": "form",
            "singlePage": true,
            "fields": [
                {
                    "name": "idp-tab",
                    "type": "tab",
                    "fields": [
                        {
                            "name": "idp-generic",
                            "label": 'Algemene informatie:',
                            "type": "form-group",
                            "fields": [
                                {
                                    "name": "id",
                                    "type": "hidden",
                                    "value": authProviderDto?.id
                                },
                                {
                                    "name": "display-name",
                                    "label": 'Titel',
                                    "type": "text",
                                    "required": true,
                                    "value": authProviderDto?.displayName
                                },
                                {
                                    "name": "information-text",
                                    "label": 'Begeleidende tekst',
                                    "type": "textarea",
                                    "value": authProviderDto?.informationText
                                },
                                {
                                    "name": "link-text",
                                    "label": 'Tekst verzendknop',
                                    "type": "text",
                                    "value": authProviderDto?.linkText
                                }
                            ]
                        },
                        {
                            "name": "idp-context",
                            "label": 'Informatie aansluiting:',
                            "type": "form-group",
                            "fields": [
                                {
                                    "name": "provider-type",
                                    "label": 'Provider type',
                                    "type": "select",
                                    "required": true,
                                    "options": this.getProviderTypes(),
                                    "values": [{ value: authProviderDto?.providerType, text: '' }] as OptionDto[]
                                },
                                {
                                    "name": "client-id",
                                    "label": 'Client Id',
                                    "type": "text",
                                    "required": true,
                                    "value": authProviderDto?.clientId
                                },
                                {
                                    "name": "client-secret",
                                    "label": 'Client Secret',
                                    "type": "text"
                                },
                                {
                                    "name": "issuer-uri",
                                    "label": 'Issuer Uri',
                                    "type": "text",
                                    "value": authProviderDto?.issuerUri
                                },
                                {
                                    "name": "scopes",
                                    "label": 'Scopes',
                                    "type": "text",
                                    "value": authProviderDto?.scopes
                                },
                                {
                                    "name": "acr-values",
                                    "label": 'Acr Values',
                                    "type": "text",
                                    "value": authProviderDto?.acrValues
                                },
                                {
                                    "name": "active",
                                    "label": 'Actief',
                                    "type": "radio",
                                    "options": [
                                        { value: "true", text: "Ja" },
                                        { value: "false", text: "Nee" }
                                    ],
                                    "values": [{ "value": authProviderDto?.active ? "true" : "false", "text": "" }]
                                }
                            ]
                        },
                        {
                            "name": "group-mapping",
                            "label": "gekoppelde groepen",
                            "type": "repeating-group",
                            "classes": "width-100",
                            "sets": this.getGroup(authProviderDto?.providerGroups),
                            "fields": [
                                {
                                    "name": "external-id",
                                    "label": "Extern id",
                                    "type": "text",
                                    "classes": "width-30 p-1 layout-column",
                                    "required": true
                                },
                                {
                                    "name": "external-name",
                                    "label": "Externe naam",
                                    "type": "text",
                                    "classes": "width-30 p-1 layout-column",
                                    "required": true
                                },
                                {
                                    "name": "group",
                                    "label": "Groep",
                                    "type": "select",
                                    "classes": "width-30 p-1 layout-column",
                                    "required": true,
                                    "options": this.getGroupOptions(groupDto)
                                }
                            ]
                        }
                    ]
                }
            ]
        };

        this.form = await Form.create(formDto);
        this.append(this.form.getContent());
    }

    getGroup(providerGroups?: TenantAuthProviderGroupDtp[]): FieldDto[][] | undefined {
        const sets: FieldDto[][] | undefined = [];
        if (!providerGroups) {
            return sets;
        }

        for (const group of providerGroups) {
            const set: FieldDto[] = [];
            set.push(
                {
                    type: 'text',
                    name: 'external-id',
                    value: group.externalId
                },
                {
                    type: 'text',
                    name: 'external-name',
                    value: group.externalName
                },
                {
                    type: 'select',
                    name: 'group',
                    values: [{value: group.groupId, text: ''}]
                },
            );

            sets.push(set);
        }

        return sets;
    }

    getGroupOptions(groupDto?: GroupRegisterRequestDto[]): OptionDto[] {
        
        return groupDto === undefined ? [] : groupDto.map(g => { 
            return {
                    value: g.id,
                    text: g.name
                } as OptionDto
            });
    }

    getProviderTypes(): OptionDto[] {
        return Object.values(ProviderType).map(p => { return { value: p, text: p } });
    }

    getFormData(form?: Form): TenantAuthProviderDto | undefined {
        if (!form) {
            return undefined;
        }
        const genericGroup = form.getTabField('idp-tab', 'idp-generic') as FormGroup;
        const contextGroup = form.getTabField('idp-tab', 'idp-context') as FormGroup;

        const providerTypeOption = contextGroup.getFieldValue('provider-type') as OptionDto[];
        if (!providerTypeOption || providerTypeOption.length === 0 || !providerTypeOption.at(0)?.value) {
            return undefined;
        }

        const providerType = providerTypeOption.at(0)?.value as ProviderType;

        const id = genericGroup.getFieldValue('id') || undefined;
        const displayName = genericGroup.getFieldValue('display-name');
        const informationText = genericGroup.getFieldValue('information-text');
        const linkText = genericGroup.getFieldValue('link-text');

        const clientId = contextGroup.getFieldValue('client-id');
        const clientSecret = contextGroup.getFieldValue('client-secret');
        const issuerUri = contextGroup.getFieldValue('issuer-uri');
        const scopes = contextGroup.getFieldValue('scopes');
        const acrValues = contextGroup.getFieldValue('acr-values');
        const enabledField = contextGroup.getField('active') as RadioField;
        const active = !!enabledField.getOptions().some(option => option.value === 'true');

        const groupMappingRG = form.getTabField('idp-tab', 'group-mapping') as RepeatingGroup;
        const sets = groupMappingRG.getSets();

        const providerGroups: TenantAuthProviderGroupDtp[] = []

        console.log('sets', sets);
        for (const index in sets) {
            const set = sets[index];

            const externalId = set[0] as TextField;
            const externalName = set[1] as TextField;
            const group = set[2] as SelectField;

            providerGroups.push({
                externalId: externalId.getValue(),
                externalName: externalName.getValue(),
                groupId: group.getSelectedValue()?? ''
            });
        }
        return {
            id,
            providerType,
            displayName,
            informationText,
            linkText,
            clientId,
            clientSecret,
            issuerUri,
            scopes,
            acrValues,
            active,
            providerGroups
        }
    }

    save() {
        if (!this.form || !this.form.validate()) {
            return;
        }

        const authProviderDto = this.getFormData(this.form);
        if (!authProviderDto) {
            return;
        }

        if (this.isNew) {
            this.post(authProviderDto);
        } else {
            this.put(authProviderDto);
        }

    }

    put(authProviderDto: TenantAuthProviderDto) {
        Http.put(`${Router.tenantPath}/api/idp/${authProviderDto.id}`, authProviderDto, {})
            .then((idp) => {
                Router.route('/admin/page/identity-providers');
            })
            .catch((error) => {

            });
    }

    post(authProviderDto: TenantAuthProviderDto) {
        Http.post(`${Router.tenantPath}/api/idp`, authProviderDto, {})
            .then((idp) => {
                Router.route('/admin/page/identity-providers');
            })
            .catch((error) => {

            });
    }

    destroy() {
        super.destroy();

        footerService.clear();
    }
}
