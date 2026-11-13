import { Page } from '../../../shared/page-components/page';
import { Lang } from '../../../shared/services/lang';
import { BuilderFormServiceRegistry } from '../../services/builder-form-service';
import { BuilderLayout } from './components/builder-layout';

export class BuilderPageSettingsLogin extends Page {
    #builderLayout: BuilderLayout = new BuilderLayout();
    #builderFormService = BuilderFormServiceRegistry.get('builder-form');
    
    constructor() {
        super(false);

        this.#builderLayout = new BuilderLayout();

    }

    /**
     * 
     */
    afterInit() {
        this.subscriptions.push(this.#builderFormService.subscribeToForm('login-form', (form) => {
            if (form) {
                const builderPageSettingsSuccess = document.createElement('div');
                builderPageSettingsSuccess.className = 'builder-page-settings';
                
                const header = document.createElement('h1');
                header.className = 'builder-page-settings-header';
                header.innerText = Lang.get('page.settings.login');
                builderPageSettingsSuccess.appendChild(header);

                this.#builderLayout.setCenterContent(builderPageSettingsSuccess, true);
                
                this.#builderLayout?.setCenterContent(form.getContent());


            }
        }));
    }

    getContent() {
        return this.#builderLayout.getContent();
    }

}
