import { ConditionsField } from '../../../shared/form-components/conditions-field';
import { Form } from '../../../shared/form-components/form';
import { RepeatingGroup } from '../../../shared/form-components/repeating-group';
import { TagField } from '../../../shared/form-components/tag-field';
import { TextField } from '../../../shared/form-components/text-field';
import { FormDto, FormVariableDto, FormWrapper, OptionDto } from '../../../shared/model/types';
import { Page } from '../../../shared/page-components/page';
import { EventService } from '../../../shared/services/event-service';
import { Lang } from '../../../shared/services/lang';
import { BuilderFormService } from '../../services/builder-form-service';
import { BuilderLayout } from './components/builder-layout';

export class BuilderPageSettingsVariables extends Page {
    #builderLayout: BuilderLayout;
    #isEditorLoaded = false;

    form: Form | null = null;
    formVariables: FormVariableDto[] = [];

    constructor() {
        super();
        this.setTitle(Lang.get('page.settings.vars'));
        this.#builderLayout = new BuilderLayout();

        const builderPageSettingsVariables = document.createElement('div');
        builderPageSettingsVariables.className = 'builder-page-settings-variables';

        const header = document.createElement('h1');
        header.className = 'builder-page-settings-header';
        header.innerText = Lang.get('page.settings.vars');
        builderPageSettingsVariables.appendChild(header);

        this.#builderLayout.setCenterContent(builderPageSettingsVariables, true);
    }

    /**
     * 
     */
    afterInit() {
        this.subscriptions.push(BuilderFormService.formWrapperSubscription((formWrapper: FormWrapper | undefined) => {

            if (this.#isEditorLoaded) {
                return;
            }

            if (formWrapper?.formConfig?.variables) {
                this.formVariables = formWrapper?.formConfig?.variables;
            } else {
                this.formVariables = [];
            }

            this.createContent();

            this.#isEditorLoaded = true;
        }));
    }

    createContent() {

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
                            "minLength": 1,
                            "fields": [
                                {
                                    "name": "name",
                                    "label": Lang.get('page.settings.vars.name'),
                                    "type": "text",
                                    "classes": "width-50 p-1 layout-column",
                                    "required": true,
                                    "change": () => { this.valueChanged(); }
                                },
                                {
                                    "name": "tag",
                                    "label": Lang.get('generic.tags'),
                                    "type": "tag",
                                    "classes": "width-50 p-1 layout-column",
                                    "required": true,
                                    "change": () => { this.valueChanged(); }
                                },
                                {
                                    "id": "repeating-group",
                                    "name": "group",
                                    "label": Lang.get('page.settings.vars.value'),
                                    "type": "repeating-group",
                                    "fields": [
                                        {
                                            "name": "name",
                                            "label": Lang.get('page.settings.vars.value'),
                                            "type": "text",
                                            "required": true,
                                            "change": () => { this.valueChanged(); }
                                        },
                                        {
                                            "name": "name",
                                            "label": Lang.get('page.settings.vars.conditions'),
                                            "type": "conditions",
                                            "required": true,
                                            "change": () => { this.valueChanged(); }
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
            this.form = form;

            this.#builderLayout?.setCenterContent(this.form.getContent());

        }).catch(() => { });
    }

    valueChanged() {
        if (!this.formVariables) {
            return;
        }
        
        const formWrapper = BuilderFormService.getFormWrapper();
        if (!formWrapper?.formConfig) {
             return;
        }

        formWrapper.formConfig.variables ??= [];

        formWrapper.formConfig.variables = this.convertFormToFormVariableDto();
        this.formVariables = formWrapper.formConfig.variables;

        BuilderFormService.setFormWrapper(formWrapper);

        EventService.emit('settings-changed', this.formVariables);
        
    }

    convertFormToFormVariableDto(): FormVariableDto[] {
        if (!this.form) {
            return [];
        }

        const formVariableDtos = [] as FormVariableDto[];
        const variablesRepeatingGroup = this.form.getTabField('variable-tab', 'variables-repeating-group') as RepeatingGroup;

        const sets = variablesRepeatingGroup.getSets();
        for (const index in sets) {
            const set = sets[index];

            const variableNameField = set[0] as TextField;
            const variableTagField = set[1] as TagField;
            const variableValueRepeatingGroup = set[2] as RepeatingGroup;

            if (!variableNameField || !variableTagField || !variableValueRepeatingGroup) {
                return [];
            }

            const variableName = variableNameField.getValue();
            const variableTag = variableTagField.getOptions();
            const variableValues = variableValueRepeatingGroup.getSets().map((valueSet) => {
                const valueField = valueSet[0] as TextField;
                const conditionField = valueSet[1] as ConditionsField;

                if (!valueField || !conditionField) {
                    return null;
                }

                return {
                    value: valueField.getValue(),
                    conditions: conditionField.getValue()
                };
            }).filter(value => value !== null);

            formVariableDtos.push({
                name: variableName,
                tag: variableTag.map((tag: OptionDto) => tag.value),
                values: variableValues as { value: string, conditions: any }[]
            });
        }
        return formVariableDtos;
    }

    getContent() {
        return this.#builderLayout.getContent();
    }
}
