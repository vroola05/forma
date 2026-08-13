import { Page } from '../../../shared/page-components/page';
import { Http } from '../../../shared/services/http';
import { Router } from '../../../shared/services/router';
import { Lang } from '../../../shared/services/lang';
import { TextField } from '../../../shared/form-components/text-field';
import { PasswordField } from '../../../shared/form-components/password-field';
import { FormButton } from '../../../shared/form-components/components/form-button';
import { AdminHeader } from '../../component/admin-header';
import { EventService } from '../../../shared/services/event-service';

export class DashboardPage extends Page {
    header: AdminHeader;

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
