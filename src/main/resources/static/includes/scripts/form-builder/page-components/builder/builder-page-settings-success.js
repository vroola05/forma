import { PageComponent } from '../../../shared/page-components/page-component.js';
import { BuilderLayout } from './components/builder-layout.js';
import { BuilderEditor } from '../../component/editor/builder-editor.js';
import { BuilderCssEditor } from '../../component/editor/builder-css-editor.js';
import { EventService } from '../../../shared/services/event-service.js';
import { BuilderFormService } from '../../services/builder-form-service.js';

export class BuilderPageSettingsSuccess extends PageComponent {
    #builderLayout = null;
    #isEditorLoaded = false;

    constructor() {
        super();

        this.#builderLayout = new BuilderLayout();

        this.editor = new BuilderEditor((data) => this.onEditorValueChanged(data));
        const content = this.editor.getContent();

        this.#builderLayout.setCenterContent(content);

        this.subscriptions.push(BuilderFormService.formWrapperSubscription((formWrapper) => {
            if (!this.#isEditorLoaded) {
                if (formWrapper?.formConfig?.formConfigSuccessPage) {
                    this.formConfigSuccessPage = formWrapper?.formConfig?.formConfigSuccessPage;
                } else {
                    this.formConfigSuccessPage = new FormConfigSuccessPage();
                }

                if (this.formConfigSuccessPage?.template) {
                    this.editor.addDataContent(formWrapper?.formConfig?.formConfigSuccessPage?.template);
                }
                this.#isEditorLoaded = true;
            }

        }));
    }

    onEditorValueChanged(data) {
        const formWrapper = BuilderFormService.getFormWrapper();
        formWrapper.formConfig.formConfigSuccessPage = this.formConfigSuccessPage;
        this.formConfigSuccessPage.template = data;
        BuilderFormService.setFormWrapper(formWrapper);


        EventService.callEventListener('settings-changed', data);
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


