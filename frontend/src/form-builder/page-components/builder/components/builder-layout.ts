import { FormButton } from '../../../../shared/form-components/components/form-button';
import { BuilderPageFormEditorBtns } from './builder-page-form-editor-btn';

import { BuilderSpacer } from './builder-spacer';

export class BuilderLayout {
    #content = document.createElement('div');

    
    #builderPageContent = document.createElement('div');
    #builderPageMenuLeftInnerContainer = document.createElement('div');
    #builderPageMenuRightContainer = document.createElement('div');
    #builderPageMenuRightInnerContainer = document.createElement('div');
    #builderPageCenterContainer = document.createElement('div');
    #onClose: (() => void) | undefined;

    constructor() {
        this.#content.className = 'builder-page-content-inner-container';

        const builderPageWrapperBtnContainer = document.createElement('div');
        builderPageWrapperBtnContainer.className = 'builder-page-wrapper-btn-container';
        this.#content.append(builderPageWrapperBtnContainer);

        const builderPageMenuLeftContainer = document.createElement('div');

        const menuToggle = new FormButton('', 'builder-btn-icon builder-page-wrapper-btn-toggle icon icon-list');
        menuToggle.setEvent(() => {
            builderPageMenuLeftContainer.classList.toggle('active');
        });
        builderPageWrapperBtnContainer.append(menuToggle.getContent());

        this.#builderPageContent = document.createElement('div');
        this.#builderPageContent.className = 'builder-page-content';
        this.#content.append(this.#builderPageContent);

        // Left menu
        builderPageMenuLeftContainer.className = 'builder-page-menu-left-container';
        this.#builderPageContent.append(builderPageMenuLeftContainer);

        const builderPageFormEditorBtns = new BuilderPageFormEditorBtns();
        builderPageMenuLeftContainer.appendChild(builderPageFormEditorBtns.getContent());

        this.#builderPageMenuLeftInnerContainer.className = 'builder-page-menu-left-container-inner';
        builderPageMenuLeftContainer.appendChild(this.#builderPageMenuLeftInnerContainer);

        const spacerLeft = new BuilderSpacer('builder-layout-left', builderPageMenuLeftContainer);
        this.#builderPageContent.appendChild(spacerLeft.getContent());

        // Center content
        this.#builderPageCenterContainer.className = 'builder-page-center-container';
        this.#builderPageContent.append(this.#builderPageCenterContainer);

        
        const spacerRight = new BuilderSpacer('builder-layout-right', this.#builderPageMenuRightContainer, true);
        this.#builderPageContent.appendChild(spacerRight.getContent());

        // Right menu
        this.#builderPageMenuRightContainer.className = 'builder-page-menu-right-container';
        this.#builderPageContent.append(this.#builderPageMenuRightContainer);

        const builderPageMenuRightBtns = document.createElement('div');
        builderPageMenuRightBtns.className = 'builder-page-menu-btns';
        this.#builderPageMenuRightContainer.appendChild(builderPageMenuRightBtns);

        const closeRightBtn = new FormButton('', 'builder-btn-icon icon icon-x-lg');
        closeRightBtn.setEvent(() => {
            if (this.#onClose) {
                this.#onClose();
            }
        });
        builderPageMenuRightBtns.appendChild(closeRightBtn.getContent());

        this.#builderPageMenuRightInnerContainer.className = 'builder-page-menu-right-inner-container';
        this.#builderPageMenuRightContainer.append(this.#builderPageMenuRightInnerContainer);

    }

    getContent() {
        return this.#content;
    }

    setLeftContent(element: Element, clear = false) {
        if (clear) this.#builderPageMenuLeftInnerContainer.innerHTML = '';
        this.#builderPageMenuLeftInnerContainer.appendChild(element);
    }

    getCenterContent() {
        return this.#builderPageCenterContainer;
    }

    setCenterContent(element: Element, clear = false) {
        if (clear) this.#builderPageCenterContainer.innerHTML = '';
        this.#builderPageCenterContainer.appendChild(element);
    }

    setRightContent(element: Element, clear = false) {
        if (clear) this.#builderPageMenuRightInnerContainer.innerHTML = '';
        this.#builderPageMenuRightInnerContainer.appendChild(element);
    }

    onClose(callback: () => void) {
        this.#onClose = callback;
        
    }

    setRightActive(active: boolean) {
        if (active) {
            this.#builderPageMenuRightContainer.classList.add('active');
        } else {
            this.#builderPageMenuRightContainer.classList.remove('active');
        }
        
    }
}