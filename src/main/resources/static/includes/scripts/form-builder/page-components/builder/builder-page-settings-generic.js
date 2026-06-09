import { PageComponent } from '../../../shared/page-components/page-component.js';
import { BuilderLayout } from './components/builder-layout.js';
import { BuilderFormService } from '../../services/builder-form-service.js'
import { Lang } from '../../../shared/services/lang.js';
import { Form } from '../../../shared/form-components/form.js';
import { FORM_STATUS } from '../../../shared/model/form-data.js'

export class BuilderPageSettingsGeneric extends PageComponent {
    #builderLayout = null;

    constructor() {
        super();

        this.#builderLayout = new BuilderLayout();

        
        
        this.subscriptions.push(BuilderFormService.formWrapperSubscription((formWrapper) => {

            this.createContent(formWrapper);
        }));


    }

    createContent(formWrapper) {

        this.form = new Form({
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
                            "id": "group",
                            "name": "group",
                            "label": Lang.get('page.settings.generic'),
                            "type": "form-group",
                            "fields": [
                                {
                                    "name": "name",
                                    "label": Lang.get('generic.name'),
                                    "type": "text",
                                    "required": true,
                                    "value": formWrapper?.form?.name
                                },
                                {
                                    "name": "label",
                                    "label": Lang.get('generic.label'),
                                    "type": "text",
                                    "required": true,
                                    "value": formWrapper?.form?.label
                                },

                                {
                                    "name": "status",
                                    "label": Lang.get('generic.status'),
                                    "type": "select",
                                    "required": true,
                                    "options": Object.entries(FORM_STATUS).map(([key, val_fnc]) => ({ value: key, text: val_fnc() })),
                                    "value": formWrapper?.form?.status
                                }
                            ]
                        }
                    ]
                }
            ]
        });

        const formGroup = this.form.getTabField('tab', 'group');

        const statusField = formGroup.getField('status');
        statusField.addValueChangedListener((key, option) => {
            BuilderFormService.getBuilderForm().setPropertyValueById('status', option?.[0].value);
            console.log(BuilderFormService.getBuilderForm().getPropertyValueById('status'));
        });

        this.#builderLayout.setCenterContent(this.form.getContent());


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
