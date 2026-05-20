import { Page } from '../../shared/page-components/page.js';
import { AdminHeader } from '../component/admin-header.js';
import { Footer } from '../../shared/generic-components/footer.js';
export class SettingsPage extends Page {

    constructor(title) {
        super();
        this.setTitle(title);

        this.adminHeader = new AdminHeader();
        this.footer = new Footer();

        this.content.className = 'settings-page-content-container';

        this.contentInner = document.createElement('div');
        this.contentInner.className = 'settings-page-inner-container';
        this.content.append(this.contentInner);

        const pageTitleContainer = document.createElement('div');
        pageTitleContainer.className = 'settings-page-title-container';
        this.contentInner.append(pageTitleContainer);

        const pageTitle = document.createElement('h1');
        pageTitle.className = 'settings-page-title';
        pageTitle.innerHTML = title;
        pageTitleContainer.append(pageTitle);

        this.titleButtonContainer = document.createElement('div');
        this.titleButtonContainer.className = 'settings-page-title-button-container';
        
        pageTitleContainer.append(this.titleButtonContainer);
    }

    addTitleButton(formButton) {
        this.titleButtonContainer.appendChild(formButton.getContent())
    }

    append(...dom) {
        this.contentInner.append(...dom);
    }

    getContent() {

        const fragment = document.createDocumentFragment();
        fragment.append(
            this.adminHeader.getContent(),
            this.content,
            this.footer.getContent());

        return fragment;
    }
}