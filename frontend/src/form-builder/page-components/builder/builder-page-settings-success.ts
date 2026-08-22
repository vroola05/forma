import { FormConfigSuccessPage } from '../../../shared/model/types';
import { Page } from '../../../shared/page-components/page';
import { EventService } from '../../../shared/services/event-service';
import { Lang } from '../../../shared/services/lang';
import { BuilderEditor } from '../../component/editor/builder-editor';
import { BuilderFormService } from '../../services/builder-form-service';
import { BuilderLayout } from './components/builder-layout';

export class BuilderPageSettingsSuccess extends Page {
    readonly #builderLayout = new BuilderLayout();
    #isEditorLoaded = false;

    builderEditor: BuilderEditor;
    formConfigSuccessPage: FormConfigSuccessPage | null = null;

    constructor() {
        super();

        const builderPageSettingsSuccess = document.createElement('div');
        builderPageSettingsSuccess.className = 'builder-page-settings-success';

        const header = document.createElement('h1');
        header.className = 'builder-page-settings-header';
        header.innerText = Lang.get('page.settings.successpage');
        builderPageSettingsSuccess.appendChild(header);

        this.builderEditor = new BuilderEditor((jsonData: any) => this.onEditorValueChanged(jsonData));
        const content = this.builderEditor.getContent();

        builderPageSettingsSuccess.append(content);
        

        this.#builderLayout.setCenterContent(builderPageSettingsSuccess);

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


