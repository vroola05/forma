import { Page } from '../../../shared/page-components/page';
import { Lang } from '../../../shared/services/lang';
import { AdminHeader } from '../../component/admin-header';

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
