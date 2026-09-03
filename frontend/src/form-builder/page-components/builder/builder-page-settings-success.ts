import { FormConfigSuccessPage, FormDto, Operator } from '../../../shared/model/types';
import { Page } from '../../../shared/page-components/page';
import { EventService } from '../../../shared/services/event-service';
import { Lang } from '../../../shared/services/lang';

import { BuilderFormService } from '../../services/builder-form-service';
import { BuilderLayout } from './components/builder-layout';
import { Form } from '../../../shared/form-components/form';
import { InputNucleus } from '../../../shared/form-components/interface/input-base';
import { FormRenderer } from '../../../shared/generic-components/form-renderer';
import { FormGroup } from '../../../shared/form-components/form-group';

export class BuilderPageSettingsSuccess extends Page {
    readonly #builderLayout = new BuilderLayout();
    #isEditorLoaded = false;
    
    formConfigSuccessPage: FormConfigSuccessPage | null = null;
    form!: Form;

    constructor() {
        super();


        this.subscriptions.push(BuilderFormService.formWrapperSubscription((formWrapper) => {
            if (this.#isEditorLoaded) {
                return;
            }

            if (formWrapper?.formConfig?.formConfigSuccessPage) {
                this.formConfigSuccessPage = formWrapper?.formConfig?.formConfigSuccessPage;
            } else {
                this.formConfigSuccessPage = {};
            }

            this.createContent();

            this.#isEditorLoaded = true;


        }));
    }

    createContent() {

        const builderPageSettingsSuccess = document.createElement('div');
        builderPageSettingsSuccess.className = 'builder-page-settings-success';

        const header = document.createElement('h1');
        header.className = 'builder-page-settings-header';
        header.innerText = Lang.get('page.settings.successpage');
        builderPageSettingsSuccess.appendChild(header);

        this.#builderLayout.setCenterContent(builderPageSettingsSuccess);
        const formDto: FormDto = {
            "id": "form",
            "name": "form",
            "label": Lang.get('page.settings.generic'),
            "type": "form",
            "singlePage": true,
            "fields": [
                {
                    "id": "tab",
                    "name": "tab",
                    "type": "tab",
                    "fields": [
                        {
                            "name": "has-success-page",
                            "label": Lang.get('page.settings.generic.successpage.summary'),
                            "type": "radio",
                            "options": [
                                { "value": "true", "text": Lang.get('generic.yes') },
                                { "value": "false", "text": Lang.get('generic.no') }
                            ],
                            "value": this.formConfigSuccessPage?.useSuccessPage === undefined ? [] : [
                                {
                                    value: this.formConfigSuccessPage?.useSuccessPage ? 'true' : 'false',
                                    text: ''
                                }],
                            "change": (key: string, value: any) => {
                                this.onEditorValueChanged(undefined, key);
                            }
                        },
                        {
                            "id": "success-page-group",
                            "name": "success-page-group",
                            "label": Lang.get('page.settings.successpage.title'),
                            "type": "form-group",
                            "condition": {
                                var1: "$.form.tab.has-success-page",
                                operator: Operator.EQ,
                                var2: "true"
                            },
                            "fields": [
                                {
                                    "name": "title",
                                    "label": Lang.get('page.settings.generic.successpage.title'),
                                    "type": "text",
                                    "value": this.formConfigSuccessPage?.title,
                                    "change": (key: string, value: any) => {
                                        this.onEditorValueChanged('success-page-group', key);
                                    }
                                },
                                {
                                    "name": "summary",
                                    "label": Lang.get('page.settings.generic.successpage.summary'),
                                    "type": "radio",
                                    "options": [
                                        { "value": "true", "text": Lang.get('generic.yes') },
                                        { "value": "false", "text": Lang.get('generic.no') }
                                    ],
                                    "value": this.formConfigSuccessPage?.showSummary === undefined ? [] : [
                                        {
                                            value: this.formConfigSuccessPage?.showSummary ? 'true' : 'false',
                                            text: ''
                                        }],
                                    "change": (key: string, value: any) => {
                                        this.onEditorValueChanged('success-page-group', key);
                                    }
                                },
                                {
                                    "name": "success-text",
                                    "label": Lang.get('page.settings.generic.successpage.text'),
                                    "type": "rich-text",
                                    "value": this.formConfigSuccessPage?.template,
                                    "change": (key: string, value: any) => {
                                        this.onEditorValueChanged('success-page-group', key);
                                    }
                                }
                            ]
                        }
                    ]
                }
            ]
        }

        FormRenderer.createForm(formDto).then(form => {
            this.form = form;
            builderPageSettingsSuccess.append(form.getContent());
        })
        .catch(() => {
        });
    }

    onEditorValueChanged(groupName?: string, fieldName?: string) {
        if (!this.formConfigSuccessPage || !this.form || !fieldName) {
            return;
        }


        if (groupName === undefined) {
            const field = this.form.getTabField('tab', fieldName) as InputNucleus;
            this.formConfigSuccessPage.useSuccessPage = !!field.getOptions().some(option => option.value === 'true');
        } else {
            const formGroup = this.form.getTabField('tab', groupName) as FormGroup;
            const field = formGroup.getField(fieldName) as InputNucleus;
            field.validate();
            if (fieldName === 'summary') {
                this.formConfigSuccessPage.showSummary = !!field.getOptions().some(option => option.value === 'true');
            } else if (fieldName === 'title') {
                this.formConfigSuccessPage.title = field.getValue();
            } else if (fieldName === 'success-text') {
                this.formConfigSuccessPage.template = field.getValue();
            }
        }
        

        const formWrapper = BuilderFormService.getFormWrapper();
        if (formWrapper?.formConfig && this.formConfigSuccessPage) {
            formWrapper.formConfig.formConfigSuccessPage = this.formConfigSuccessPage;

            BuilderFormService.setFormWrapper(formWrapper);

            EventService.emit('settings-changed', this.formConfigSuccessPage);
        }
    }

    /**
     * 
     */
    afterInit() {

    }

    getContent() {
        return this.#builderLayout.getContent();
    }
}


