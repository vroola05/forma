import { FormConfigSuccessPage } from '../../../shared/model/types';
import { Page } from '../../../shared/page-components/page';
import { EventService } from '../../../shared/services/event-service';
import { BuilderEditor } from '../../component/editor/builder-editor';
import { BuilderFormService } from '../../services/builder-form-service';
import { BuilderLayout } from './components/builder-layout';

export class BuilderPageSettingsSuccess extends Page {
    #builderLayout = new BuilderLayout();
    #isEditorLoaded = false;
    builderEditor: BuilderEditor;
    formConfigSuccessPage: FormConfigSuccessPage | null = null;

    constructor() {
        super();

        this.builderEditor = new BuilderEditor((jsonData: any) => this.onEditorValueChanged(jsonData));
        const content = this.builderEditor.getContent();

        this.#builderLayout.setCenterContent(content);

        this.subscriptions.push(BuilderFormService.formWrapperSubscription((formWrapper) => {
            if (!this.#isEditorLoaded) {
                if (formWrapper?.formConfig?.formConfigSuccessPage) {
                    this.formConfigSuccessPage = formWrapper?.formConfig?.formConfigSuccessPage;
                } else {
                    this.formConfigSuccessPage = {};
                }

                if (this.formConfigSuccessPage?.template) {
                    this.builderEditor.addDataContent(formWrapper?.formConfig?.formConfigSuccessPage?.template);
                }
                this.#isEditorLoaded = true;
            }

        }));
    }

    onEditorValueChanged(jsonData: any) {
        const formWrapper = BuilderFormService.getFormWrapper();
        if (formWrapper?.formConfig && this.formConfigSuccessPage) {
            formWrapper.formConfig.formConfigSuccessPage = this.formConfigSuccessPage;
            this.formConfigSuccessPage.template = jsonData;
            BuilderFormService.setFormWrapper(formWrapper);

            EventService.emit('settings-changed', jsonData);
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


