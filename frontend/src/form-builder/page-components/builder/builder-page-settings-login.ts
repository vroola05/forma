import { Page } from '../../../shared/page-components/page';
import { BuilderLayout } from './components/builder-layout';

export class BuilderPageSettingsLogin extends Page {
    #builderLayout: BuilderLayout;
    
    constructor() {
        super();

        this.#builderLayout = new BuilderLayout();

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
