import { SettingsPage } from '../settings-page.js';
import { Http } from '../../../shared/services/http.js';
import { Router } from '../../../shared/services/router.js';
import { Lang } from '../../../shared/services/lang.js';
import { TextField } from '../../../shared/form-components/text-field.js';
import { PasswordField } from '../../../shared/form-components/password-field.js';
import { FormButton } from '../../../shared/form-components/components/form-button.js';
import { AdminHeader } from '../../component/admin-header.js';
import { Column, List, ListDefinition } from '../../../shared/generic-components/list.js';
import { EventService } from '../../../shared/services/event-service.js';

export class TenantPage extends SettingsPage {

    constructor() {
        super(Lang.get('tenant.title'));
        
        this.createContent();

        this.addTitleButton(new FormButton('','icon icon-plus-lg','/admin/page/tenant/new'))
    }

    createContent() {
        this.tenantList = new List(new ListDefinition([
            new Column('Name', 'text', 'name'),
            new Column('Slug', 'boolean', 'slug'),
            new Column('Status', 'boolean', 'status')
        ]));

        this.tenantList.setOnClick((index, tenant) => {
            Router.route(`/admin/page/tenant/edit/${tenant.slug}`);
        });
        this.append(this.tenantList.getContent());

    }

    afterInit() {
        Http.post(`${Router.tenantPath}/api/tenant/list`, {})
        .then((tenants) => {
            this.tenantList.setData(tenants);
        })
        .catch((error) => {
            console.error(error);
        });
    }
    
}
