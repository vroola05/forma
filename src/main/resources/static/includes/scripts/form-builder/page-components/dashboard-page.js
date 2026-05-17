import { Page } from '../../shared/page-components/page.js';
import { Http } from '../../shared/services/http.js';
import { Router } from '../../shared/services/router.js';
import { Lang } from '../../shared/services/lang.js';
import { TextField } from '../../shared/form-components/text-field.js';
import { PasswordField } from '../../shared/form-components/password-field.js';
import { FormButton } from '../../shared/form-components/components/form-button.js';
import { AdminHeader } from '../component/admin-header.js';
import { EventService } from '../../shared/services/event-service.js';

export class DashboardPage extends Page {

    loader = document.querySelector('.loader');

    constructor() {
        super();
        this.setTitle(Lang.get('dashboad.title'));
        this.header = new AdminHeader();

        this.createContent();
    }

    createContent() {

        this.content = document.createElement('div');
        this.content.className = 'dashboard-container';
        
        
        
    }

    afterInit() {

    }

    getContent() {
        const fragment = document.createDocumentFragment();
        fragment.append(this.header.getContent(), this.content)
        return fragment;
    }
}
