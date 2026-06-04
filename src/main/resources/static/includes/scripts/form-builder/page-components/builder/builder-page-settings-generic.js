import { PageComponent } from '../../../shared/page-components/page-component.js';
import { BuilderLayout } from './components/builder-layout.js';
import { BuilderFormService } from '../../services/builder-form-service.js'
import { Lang } from '../../../shared/services/lang.js';
import { Form } from '../../../shared/form-components/form.js';

export class BuilderPageSettingsGeneric extends PageComponent {
    #builderLayout = null;

    constructor() {
        super();

        this.#builderLayout = new BuilderLayout();

        console.log(BuilderFormService.getBuilderForm());
        this.subscriptions.push(BuilderFormService.formWrapperSubscription((formWrapper) => {
            
        }));

        this.createContent();
    }

    createContent() {




        this.form = new Form({
                    "id": "user-form",
                    "name": "user-form",
                    "label": Lang.get('user.new.title'),
                    "type": "form",
                    "singlePage": true,
                    "fields": [
                        {
                            "id": "user-tab",
                            "name": "user-tab",
                            "type": "tab",
                            "fields": [
                                {
                                    "id": "user-group",
                                    "name": "user-group",
                                    "label": Lang.get('user.new.title'),
                                    "type": "form-group",
                                    "fields": [
                                        {
                                            "name": "name",
                                            "label": Lang.get('generic.name'),
                                            "type": "text",
                                            "required": true
                                        },

                                        {
                                            "name": "status",
                                            "label": Lang.get('generic.status'),
                                            "type": "text",
                                            "required": true
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
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
