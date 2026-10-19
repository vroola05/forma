import { ConditionsField } from "../../../../../shared/form-components/conditions-field";
import { Form } from "../../../../../shared/form-components/form";
import { HiddenField } from "../../../../../shared/form-components/hidden-field";
import { RepeatingGroup } from "../../../../../shared/form-components/repeating-group";
import { TagField } from "../../../../../shared/form-components/tag-field";
import { TextField } from "../../../../../shared/form-components/text-field";
import { FieldDto, FormDto, FormVariableDto, FormVariableValueDto, OptionDto } from "../../../../../shared/model/types";
import { Lang } from "../../../../../shared/services/lang";
import { BuilderFormServiceRegistry } from "../../../../services/builder-form-service";

export class FormVariables {
    #builderFormService = BuilderFormServiceRegistry.get('builder-form');

    createForm(variables: FormVariableDto[] | undefined) {
        const formDto: FormDto = {
            "name": "variable-form",
            "label": '',
            "type": "form",
            "singlePage": true,
            "fields": [
                {
                    "name": "variable-tab",
                    "type": "tab",
                    "fields": [
                        {

                            "name": "variables-repeating-group",
                            "label": Lang.get('page.settings.vars.table'),
                            "type": "repeating-group",
                            "sets": this.#getSets(variables),
                            "fields": [
                                {
                                    "name": "id",
                                    "type": "hidden"
                                },
                                {
                                    "name": "name",
                                    "label": Lang.get('page.settings.vars.name'),
                                    "type": "text",
                                    "classes": "width-50 p-1 layout-column",
                                    "required": true
                                },
                                {
                                    "name": "tag",
                                    "label": Lang.get('generic.tags'),
                                    "type": "tag",
                                    "classes": "width-50 p-1 layout-column",
                                    "required": true
                                },
                                {
                                    "name": "values-repeating-group",
                                    "label": Lang.get('page.settings.vars.value'),
                                    "type": "repeating-group",
                                    "fields": [
                                        {
                                            "name": "id",
                                            "type": "hidden"
                                        },
                                        {
                                            "name": "value",
                                            "label": Lang.get('page.settings.vars.value'),
                                            "type": "text",
                                            "required": true
                                        },
                                        {
                                            "name": "condition",
                                            "label": Lang.get('page.settings.vars.conditions'),
                                            "type": "conditions",
                                            "required": true
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        }

        Form.create(formDto).then(form => {
            this.#builderFormService.setForm('variables', form);
        }).catch(() => { });
    }


    #getSets(formVariables: FormVariableDto[] | undefined): FieldDto[][] | undefined {
        const sets: FieldDto[][] | undefined = [];
        if (!formVariables) {
            return sets;
        }

        for (const variable of formVariables) {
            const set: FieldDto[] = [];
            set.push(
                {
                    type: 'hidden',
                    name: 'id',
                    value: variable.id
                },
                {
                    type: 'text',
                    name: 'name',
                    value: variable.name
                },
                {
                    type: 'tag',
                    name: 'tag',
                    values: this.#getTagOptions(variable.tags)
                },
                {
                    type: 'repeating-group',
                    name: 'values-repeating-group',
                    sets: this.#getVariableValueSets(variable.values)
                }
            );

            sets.push(set);
        }

        return sets;
    }

    #getTagOptions(tags: string[] | undefined): OptionDto[] {
        if (!tags) {
            return [];
        }
        return tags.map(tag => ({ value: tag, text: tag }));
    }

    #getVariableValueSets(values: FormVariableValueDto[] | undefined): FieldDto[][] {
        const sets: FieldDto[][] | undefined = [];
        if (!values) {
            return sets;
        }

        for (const value of values) {
            const set: FieldDto[] = [];
            set.push(
                {
                    type: 'hidden',
                    name: 'id',
                    value: value.id
                },
                {
                    type: 'text',
                    name: 'value',
                    value: value.value
                },
                {
                    type: 'conditions',
                    name: 'condition',
                    value: value.conditions
                }
            );

            sets.push(set);
        }

        return sets;
    }

    getFormData(): FormVariableDto[] {
        const form = this.#builderFormService.getForm('variables');

        if (!form) {
            return [];
        }

        const formVariableDtos = [] as FormVariableDto[];
        const variablesRepeatingGroup = form.getTabField('variable-tab', 'variables-repeating-group') as RepeatingGroup;

        const sets = variablesRepeatingGroup.getSets();
        for (const index in sets) {
            const set = sets[index];

            const variableIdField = set[0] as TextField;
            const variableNameField = set[1] as TextField;
            const variableTagField = set[2] as TagField;
            const variableValueRepeatingGroup = set[3] as RepeatingGroup;

            if (!variableIdField || !variableNameField || !variableTagField || !variableValueRepeatingGroup) {
                return [];
            }

            const variableName = variableNameField.getValue();
            const variableTag = variableTagField.getOptions();
            const variableValues = variableValueRepeatingGroup.getSets().map((valueSet) => {
                const idField = valueSet[0] as HiddenField;
                const valueField = valueSet[1] as TextField;
                const conditionField = valueSet[2] as ConditionsField;

                if (!idField || !valueField || !conditionField) {
                    return null;
                }

                return {
                    id: idField.getValue(),
                    value: valueField.getValue(),
                    conditions: conditionField.getValue()
                };
            }).filter(value => value !== null);

            formVariableDtos.push({
                id: variableIdField.getValue(),
                name: variableName,
                tags: variableTag.map((tag: OptionDto) => tag.value) as string[],
                values: variableValues as { value: string, conditions: any }[]
            });
        }
        return formVariableDtos;
    }
}