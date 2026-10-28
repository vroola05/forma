import { Form } from "../../../../../shared/form-components/form";
import { FORM_STATUS, FormDto, FormWrapper, OptionDto } from "../../../../../shared/model/types";
import { Lang } from "../../../../../shared/services/lang";
import { BuilderFormServiceRegistry } from "../../../../services/builder-form-service";


export class FormGeneric {
    #builderFormService = BuilderFormServiceRegistry.get('builder-form');

    createForm(formWrapper: FormWrapper | undefined) {
        const formDto: FormDto = {
            "name": "generic-form",
            "label": Lang.get('page.settings.generic'),
            "type": "form",
            "singlePage": true,
            "fields": [
                {
                    "name": "tab",
                    "type": "tab",
                    "fields": [
                        {
                            "name": "generic-group",
                            "type": "form-group",
                            "fields": [
                                {
                                    "name": "name",
                                    "label": Lang.get('prop.name.label'),
                                    "type": "text",
                                    "required": true,
                                    "value": formWrapper?.form?.name
                                },
                                {
                                    "name": "label",
                                    "label": Lang.get('prop.label.label'),
                                    "type": "text",
                                    "required": true,
                                    "value": this.#builderFormService?.getBuilderForm()?.getDefaultLabel(formWrapper?.form?.labels)
                                },
                                {
                                    "name": "status",
                                    "label": Lang.get('generic.status'),
                                    "type": "select",
                                    "required": true,
                                    "options": Object.entries(FORM_STATUS).map(([key, val_fnc]) => ({ value: key, text: val_fnc() })),
                                    "values": [{ value: formWrapper?.form?.status }] as OptionDto[]
                                }
                            ]
                        }
                    ]
                }
            ]
        }

        return Form.create(formDto);
    }

}