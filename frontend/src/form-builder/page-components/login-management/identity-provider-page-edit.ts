import { Lang } from '../../../shared/services/lang';
import { Router } from '../../../shared/services/router';
import { SettingsPage } from '../settings-page';

import { FormButton } from '../../../shared/form-components/components/form-button';

import { FormDto, GroupRegisterRequestDto, OptionDto, ProviderType, TenantAuthProviderDto } from '../../../shared/model/types';
import { footerService } from '../../../shared/services/footer-service';

import { Form } from '../../../shared/form-components/form';
import { FormGroup } from '../../../shared/form-components/form-group';
import { RadioField } from '../../../shared/form-components/radio-field';
import { Http } from '../../../shared/services/http';

export class IdentityProviderPageEdit extends SettingsPage {
    form: Form | null = null;
    group: GroupRegisterRequestDto = {};
    isNew = false;

    constructor() {
        super(Lang.get('idp.title'));

        const id = Router.getUrlParameter('id') as string;
        this.isNew = id === 'new';

        Http.get(`${Router.tenantPath}/api/idp/${id}`)
            .then((idp) => {
                this.createContent(idp);
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

    

    createContent(authProviderDto?: TenantAuthProviderDto) {
       
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
                                    "name": "displayName",
                                    "label": 'Titel',
                                    "type": "text",
                                    "required": true,
                                    "value": authProviderDto?.displayName
                                },
                                {
                                    "name": "informationText",
                                    "label": 'Begeleidende tekst',
                                    "type": "textarea",
                                    "value": authProviderDto?.informationText
                                },
                                {
                                    "name": "linkText",
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
                                    "name": "providerType",
                                    "label": 'Provider type',
                                    "type": "select",
                                    "required": true,
                                    "options": this.getProviderTypes(),
                                    "values": [{value: authProviderDto?.providerType, text: ''}] as OptionDto[]
                                },
                                {
                                    "name": "clientId",
                                    "label": 'Client Id',
                                    "type": "text",
                                    "required": true,
                                    "value": authProviderDto?.clientId
                                },
                                {
                                    "name": "clientSecret",
                                    "label": 'Client Secret',
                                    "type": "text"
                                },
                                {
                                    "name": "issuerUri",
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
                                    "name": "acrValues",
                                    "label": 'Acr Values',
                                    "type": "text",
                                    "value": authProviderDto?.acrValues
                                },
                                {
                                    "name": "active",
                                    "label": 'Actief',
                                    "type": "radio",
                                    "options": [
                                        {value: "true",text:"Ja"},
                                        {value: "false",text:"Nee"}
                                    ],
                                    "values": [{"value": authProviderDto?.active ? "true": "false", "text": ""}]
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

    getProviderTypes(): OptionDto[] {
        return Object.values(ProviderType).map(p => { return {value: p, text: p}});
    }

    getFormData(form?: Form): TenantAuthProviderDto | undefined {
        if (!form) {
            return undefined;
        }
        const genericGroup = form.getTabField('idp-tab', 'idp-generic') as FormGroup;
        const contextGroup = form.getTabField('idp-tab', 'idp-context') as FormGroup;

        const providerTypeOption = contextGroup.getFieldValue('providerType') as OptionDto[];
        if (!providerTypeOption || providerTypeOption.length === 0 || !providerTypeOption.at(0)?.value) {
            return undefined;
        }

        const providerType = providerTypeOption.at(0)?.value as ProviderType;

        const id = genericGroup.getFieldValue('id') || undefined;
        const displayName = genericGroup.getFieldValue('displayName');
        const informationText = genericGroup.getFieldValue('informationText');
        const linkText = genericGroup.getFieldValue('linkText');

        const clientId = contextGroup.getFieldValue('clientId');
        const clientSecret = contextGroup.getFieldValue('clientSecret');
        const issuerUri = contextGroup.getFieldValue('issuerUri');
        const scopes = contextGroup.getFieldValue('scopes');
        const acrValues = contextGroup.getFieldValue('acrValues');
        const enabledField = contextGroup.getField('active') as RadioField;
        const active = !!enabledField.getOptions().some(option => option.value === 'true');

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
            active
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
