import { Form } from '../../../shared/form-components/form';
import { FormVariableDto } from '../../../shared/model/types';
import { Page } from '../../../shared/page-components/page';
import { Lang } from '../../../shared/services/lang';
import { BuilderFormServiceRegistry } from '../../services/builder-form-service';
import { BuilderLayout } from './components/builder-layout';

export class BuilderPageSettingsVariables extends Page {
    #builderLayout: BuilderLayout;
    #builderFormService = BuilderFormServiceRegistry.get('builder-form');

    form: Form | null = null;
    formVariables: FormVariableDto[] = [];

    constructor() {
        super(false);

        this.setTitle(Lang.get('page.settings.vars'));
        this.#builderLayout = new BuilderLayout();

        
    }

    /**
     * 
     */
    afterInit() {
        this.subscriptions.push(this.#builderFormService.subscribeToForm('variable-form', (variablesForm) => {
            const content = variablesForm?.getContent();
            if (content) {
                const builderPageSettingsVariables = document.createElement('div');
                builderPageSettingsVariables.className = 'builder-page-settings';

                const header = document.createElement('h1');
                header.className = 'builder-page-settings-header';
                header.innerText = Lang.get('page.settings.vars');
                builderPageSettingsVariables.appendChild(header);

                this.#builderLayout.setCenterContent(builderPageSettingsVariables, true);
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
