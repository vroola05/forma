import { FormGroup } from "../../../../../shared/form-components/form-group";
import { InputNucleus } from "../../../../../shared/form-components/interface/input-base";
import { RadioField } from "../../../../../shared/form-components/radio-field";
import { FormRenderer } from "../../../../../shared/generic-components/form-renderer";
import { FormConfigSuccessPageDto, FormDto, Operator } from "../../../../../shared/model/types";
import { Lang } from "../../../../../shared/services/lang";
import { BuilderFormServiceRegistry } from "../../../../services/builder-form-service";

export class FormVariables {
    #builderFormService = BuilderFormServiceRegistry.get('builder-form');

    createForm(successPageDto: FormConfigSuccessPageDto | undefined) {
        const formDto: FormDto = {
            "id": "form",
            "name": "form",
            "label": Lang.get('page.settings.generic'),
            "type": "form",
            "singlePage": true,
            "fields": [
                {
                    "name": "success-page-tab",
                    "type": "tab",
                    "fields": [
                        {
                            "name": "id",
                            "type": "hidden"
                        },
                        {
                            "name": "custom-success-page",
                            "label": Lang.get('page.settings.successpage.custom'),
                            "type": "radio",
                            "options": [
                                { "value": "true", "text": Lang.get('generic.yes') },
                                { "value": "false", "text": Lang.get('generic.no') }
                            ],
                            "values": [{
                                value: !successPageDto?.customSuccessPage ? 'false' : 'true',
                                text: ''
                            }]
                        },
                        {
                            "name": "success-page-group",
                            "label": Lang.get('page.settings.successpage.title'),
                            "type": "form-group",
                            "condition": {
                                var1: "$.form.tab.custom-success-page",
                                operator: Operator.EQ,
                                var2: "true"
                            },
                            "fields": [
                                {
                                    "name": "title",
                                    "label": Lang.get('page.settings.generic.successpage.title'),
                                    "type": "text",
                                    "value": successPageDto?.title
                                },
                                {
                                    "name": "summary",
                                    "label": Lang.get('page.settings.generic.successpage.summary'),
                                    "type": "radio",
                                    "options": [
                                        { "value": "true", "text": Lang.get('generic.yes') },
                                        { "value": "false", "text": Lang.get('generic.no') }
                                    ],
                                    "values": successPageDto?.showSummary === undefined ? [] : [
                                        {
                                            value: successPageDto?.showSummary ? 'true' : 'false',
                                            text: ''
                                        }]
                                },
                                {
                                    "name": "download-text",
                                    "label": Lang.get('page.settings.generic.successpage.title'),
                                    "type": "text",
                                    "value": successPageDto?.downloadText
                                },
                                {
                                    "name": "success-text",
                                    "label": Lang.get('page.settings.generic.successpage.text'),
                                    "type": "rich-text",
                                    "value": successPageDto?.template

                                }
                            ]
                        }
                    ]
                }
            ]
        }

        FormRenderer.createForm(formDto).then(form => {
            this.#builderFormService.setForm('success', form);
        })
        .catch(() => {
        });
    }

    getFormData(): FormConfigSuccessPageDto | undefined {
            const form = this.#builderFormService.getForm('success');
    
            if (!form) {
                return undefined;
            }
    
            const id = form.getTabField('success-page-tab', 'id') as InputNucleus;
            const customSuccessPage = form.getTabField('success-page-tab', 'custom-success-page') as RadioField;
            const successPageGroup = form.getTabField('success-page-tab', 'success-page-group') as FormGroup;
            const showSummary = successPageGroup.getField('summary');

            return  {
                id: id.getValue(),
                customSuccessPage: !!customSuccessPage.getOptions().some(option => option.value === 'true'),
                title: successPageGroup.getFieldValue('title'),
                showSummary: showSummary === undefined ? false : showSummary.getOptions().some(option => option.value === 'true'),
                downloadText: successPageGroup.getFieldValue('download-text'),
                template: successPageGroup.getFieldValue('success-text')
            };
        }
}