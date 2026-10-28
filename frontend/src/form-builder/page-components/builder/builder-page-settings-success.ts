import { FormConfigSuccessPageDto } from '../../../shared/model/types';
import { Page } from '../../../shared/page-components/page';
import { Lang } from '../../../shared/services/lang';

import { Form } from '../../../shared/form-components/form';
import { BuilderFormServiceRegistry } from '../../services/builder-form-service';
import { BuilderLayout } from './components/builder-layout';

export class BuilderPageSettingsSuccess extends Page {
    readonly #builderLayout = new BuilderLayout();
    #builderFormService = BuilderFormServiceRegistry.get('builder-form');
    #isEditorLoaded = false;

    formConfigSuccessPage: FormConfigSuccessPageDto | null = null;
    form!: Form;

    constructor() {
        super(false);

        this.subscriptions.push(this.#builderFormService.subscribeToFormWrapper((formWrapper) => {
            if (this.#isEditorLoaded) {
                return;
            }

            if (formWrapper?.formConfig?.formConfigSuccessPage) {
                this.formConfigSuccessPage = formWrapper?.formConfig?.formConfigSuccessPage;
            } else {
                this.formConfigSuccessPage = {};
            }

            this.#isEditorLoaded = true;
        }));
    }

    /**
     * 
     */
    afterInit() {
        this.subscriptions.push(this.#builderFormService.subscribeToForm('success-form', (successForm) => {
            const content = successForm?.getContent();
            if (content) {
                const builderPageSettingsSuccess = document.createElement('div');
                builderPageSettingsSuccess.className = 'builder-page-settings';

                const header = document.createElement('h1');
                header.className = 'builder-page-settings-header';
                header.innerText = Lang.get('page.settings.successpage');
                builderPageSettingsSuccess.appendChild(header);

                this.#builderLayout.setCenterContent(builderPageSettingsSuccess, true);
                this.#builderLayout.setCenterContent(content);
            }
        }));
    }

    getContent() {
        return this.#builderLayout.getContent();
    }

    destroy() {
        super.destroy();
    }
}


