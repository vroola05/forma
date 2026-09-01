import { Form } from '../../../shared/form-components/form';
import { FORM_STATUS, FormDto, FormWrapper, OptionDto } from '../../../shared/model/types';
import { Page } from '../../../shared/page-components/page';
import { EventService } from '../../../shared/services/event-service';
import { Lang } from '../../../shared/services/lang';
import { BuilderFormService } from '../../services/builder-form-service';
import { BuilderLayout } from './components/builder-layout';

export class BuilderPageSettingsGeneric extends Page {
    #builderLayout: BuilderLayout = new BuilderLayout();
    form: Form | null = null;

    constructor() {
        super();
    }

    createContent(formWrapper: FormWrapper) {

        const formDto:FormDto = {
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
                                    "label": Lang.get('prop.name.label'),
                                    "type": "text",
                                    "required": true,
                                    "value": formWrapper?.form?.name,
                                    "change": (key: string, value: any) => {
                                        BuilderFormService?.getBuilderForm()?.setPropertyValueById(key, value);
                                        EventService.emit('field-changed');
                                    }
                                },
                                {
                                    "name": "label",
                                    "label": Lang.get('prop.label.label'),
                                    "type": "text",
                                    "required": true,
                                    "value": BuilderFormService?.getBuilderForm()?.getDefaultLabel(formWrapper?.form?.labels),
                                    "change": (key: string, value: any) => {
                                        BuilderFormService?.getBuilderForm()?.setDefaultLabel(value);
                                        EventService.emit('field-changed');
                                    }
                                },
                                {
                                    "name": "status",
                                    "label": Lang.get('generic.status'),
                                    "type": "select",
                                    "required": true,
                                    "options": Object.entries(FORM_STATUS).map(([key, val_fnc]) => ({ value: key, text: val_fnc() })),
                                    "value": [{value:formWrapper?.form?.status}] as OptionDto[],
                                    "change": (key: string, options: OptionDto[]) => {
                                        BuilderFormService?.getBuilderForm()?.setPropertyValueById(key, options?.[0].value);
                                        EventService.emit('field-changed');
                                    }
                                }
                            ]
                        }
                    ]
                }
            ]
        }

        Form.create(formDto).then(form => {
            this.form = form;

            this.#builderLayout?.setCenterContent(this.form.getContent(), true);
        }).catch(() => {});
    }

    /**
     * 
     */
    afterInit() {
        this.subscriptions.push(BuilderFormService.formWrapperSubscription((formWrapper: FormWrapper | undefined) => {
            if (!formWrapper) {
                return;
            }
            this.createContent(formWrapper);
        }));
    }

    getContent() {
        return this.#builderLayout.getContent();
    }

    destroy() {
        super.destroy();
    }
}
