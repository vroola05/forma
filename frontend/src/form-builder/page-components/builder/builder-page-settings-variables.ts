import { Form } from '../../../shared/form-components/form';
import { RepeatingGroup } from '../../../shared/form-components/repeating-group';
import { FORM_STATUS, FormDto, FormWrapper, OptionDto } from '../../../shared/model/types';
import { Page } from '../../../shared/page-components/page';
import { EventService } from '../../../shared/services/event-service';
import { Lang } from '../../../shared/services/lang';
import { BuilderFormService } from '../../services/builder-form-service';
import { BuilderLayout } from './components/builder-layout';

export class BuilderPageSettingsVariables extends Page {
    #builderLayout: BuilderLayout;
    form: Form | null = null;
    constructor() {
        super();

        this.#builderLayout = new BuilderLayout();



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

    createContent(formWrapper: FormWrapper) {

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
                            "id": "repeating-group",
                            "name": "group",
                            "label": Lang.get('page.settings.generic'),
                            "type": "repeating-group",
                            "fields": [
                                
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
    
    getContent() {
        return this.#builderLayout.getContent();
    }
}
