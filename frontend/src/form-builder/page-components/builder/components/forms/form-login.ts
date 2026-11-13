import { CheckboxField } from "../../../../../shared/form-components/checkbox-field";
import { Form } from "../../../../../shared/form-components/form";
import { InputNucleus } from "../../../../../shared/form-components/interface/input-base";
import { FormConfigLoginPageDto, FormDto, OptionDto } from "../../../../../shared/model/types";
import { Lang } from "../../../../../shared/services/lang";


export class FormLogin {

    createForm(loginPageDto: FormConfigLoginPageDto | undefined) {
        
        const formDto: FormDto = {
            "name": "login-form",
            "label": '',
            "type": "form",
            "singlePage": true,
            "fields": [
                {
                    "name": "login-methods-tab",
                    "type": "tab",
                    "fields": [
                        {
                            "name": "description",
                            "label": Lang.get('login.default.description'),
                            "type": "rich-text",
                            "required": true,
                            "value": loginPageDto?.loginInstructions

                        },
                        {
                            "name": "default-login-methods",
                            "label": Lang.get('login.default.method'),
                            "type": "checkbox",
                            "required": true,
                            "options": [
                                { "value": "NONE", "text": Lang.get('login.default.method.none') },
                                { "value": "FORM_LOGIN", "text": Lang.get('login.default.method.form.login') }
                            ],
                            "values": this.getDefaultLoginMethods(loginPageDto)
                        }
                    ]
                }
            ]
        }

        return Form.create(formDto);
    }

    getDefaultLoginMethods(loginPageDto?: FormConfigLoginPageDto): OptionDto[] {
        if (loginPageDto === undefined) {
            return [{'value': 'NONE', 'text': ''}];
        }

        const output = [];
        if (loginPageDto.publicAccess) {
            output.push({'value': 'NONE', 'text': ''});
        }

        if (loginPageDto.allowFormLogin) {
            output.push({'value': 'FORM_LOGIN', 'text': ''});
        }
        
        return output
    }

    getFormData(form?: Form): FormConfigLoginPageDto | undefined {
        if (!form) {
            return undefined;
        }
        const descriptionField = form.getTabField('login-methods-tab', 'description') as InputNucleus;
        const description = descriptionField ? descriptionField.getValue() : undefined
        const defaultLoginMethods = form.getTabField('login-methods-tab', 'default-login-methods') as CheckboxField;

        return {
            loginInstructions: description,
            publicAccess: defaultLoginMethods.getOptions().some(option => option.value === 'NONE'),
            allowFormLogin: defaultLoginMethods.getOptions().some(option => option.value === 'FORM_LOGIN'),
            providerIds: []
        }
    }
}