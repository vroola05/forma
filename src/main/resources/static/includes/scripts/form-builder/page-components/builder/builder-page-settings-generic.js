import { PageComponent } from '../../../shared/page-components/page-component.js';
import { BuilderLayout } from './components/builder-layout.js';

export class BuilderPageSettingsGeneric extends PageComponent {
    #builderLayout = null;

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
