import { FormButton } from '../../shared/form-components/components/form-button';
import { Footer } from '../../shared/generic-components/footer';
import { Page } from '../../shared/page-components/page';
import { footerService } from '../../shared/services/footer-service';
import { AdminHeader } from '../component/admin-header';
export class SettingsPage extends Page {
    contentInner = document.createElement('div');
    titleButtonContainer = document.createElement('div');
    pageTitle = document.createElement('h1');
    

    adminHeader: AdminHeader;
    footer: Footer;

    constructor(title: string) {
        super();
        
        this.setTitle(title);

        this.adminHeader = new AdminHeader();
        this.footer = new Footer();

        this.content.className = 'settings-page-content-container';

        this.contentInner.className = 'settings-page-inner-container';
        this.content.append(this.contentInner);

        const pageTitleContainer = document.createElement('div');
        pageTitleContainer.className = 'settings-page-title-container';
        this.contentInner.append(pageTitleContainer);

        this.pageTitle.className = 'settings-page-title';
        this.pageTitle.textContent = title;
        pageTitleContainer.append(this.pageTitle);

        this.titleButtonContainer.className = 'settings-page-title-button-container';
        
        pageTitleContainer.append(this.titleButtonContainer);

        
    }

    setTitle(title: string) {
        super.setTitle(title);
        this.pageTitle.textContent = title;
    }

    addTitleButton(formButton: FormButton) {
        this.titleButtonContainer.appendChild(formButton.getContent())
    }

    append(...dom: HTMLElement[]) {
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

    destroy(): void {
        super.destroy();
        footerService.clear();
    }

}