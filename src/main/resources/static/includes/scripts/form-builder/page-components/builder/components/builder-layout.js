import { BuilderPageSettingButtons } from './builder-page-setting-buttons.js';

export class BuilderLayout {
    #content = document.createElement('div');
    
    #builderPageMenuLeftContainer = document.createElement('div');
    #builderPageMenuRightContainer = document.createElement('div');
    #builderPageCenterContainer = document.createElement('div');

    constructor() {
        this.#content.className = 'container-fluid mt-4 builder-page-wrapper';

        const builderPageContentContainer = document.createElement('div');
        builderPageContentContainer.className = 'builder-page-#content-container mt-5 ms-5 me-5 mb-3';
        this.#content.append(builderPageContentContainer);

        const rowContainer = document.createElement('div');
        rowContainer.className = 'row';
        builderPageContentContainer.append(rowContainer);

        const builderPageMenuLeftContainer = document.createElement('div');
        builderPageMenuLeftContainer.className = 'builder-page-menu-left-container col col-3';
        rowContainer.append(builderPageMenuLeftContainer);

        this.#builderPageCenterContainer.className = 'builder-page-center-container col col-6';
        rowContainer.append(this.#builderPageCenterContainer);

        this.#builderPageMenuRightContainer.className = 'builder-page-menu-right-container col col-3';
        rowContainer.append(this.#builderPageMenuRightContainer);

        const builderPageSettingButtons = new BuilderPageSettingButtons();
        builderPageMenuLeftContainer.appendChild(builderPageSettingButtons.getContent());

        this.#builderPageMenuLeftContainer.className = 'builder-page-menu-left-container-inner';
        builderPageMenuLeftContainer.appendChild(this.#builderPageMenuLeftContainer);
    }

    getContent() {
        return this.#content;
    }

    setLeftContent(element) {
        this.#builderPageMenuLeftContainer.appendChild(element);
    }

    getCenterContent() {
        return this.#builderPageCenterContainer;
    }

    setCenterContent(element) {
        this.#builderPageCenterContainer.appendChild(element);
    }

    setRightContent(element) {
        this.#builderPageMenuRightContainer.appendChild(element);
    }
}