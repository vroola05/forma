import { SettingsPage } from '../settings-page';
import { Http } from '../../../shared/services/http';
import { Router } from '../../../shared/services/router';
import { Lang } from '../../../shared/services/lang';
import { FormButton } from '../../../shared/form-components/components/form-button';
import { Column, List, ListDefinition } from '../../../shared/generic-components/list';

export class TenantPage extends SettingsPage {
    tenantList: List;

    constructor() {
        super(Lang.get('tenant.title'));
        
        this.tenantList = new List(new ListDefinition([
            new Column(Lang.get('generic.name'), 'text', 'name'),
            new Column(Lang.get('generic.slug'), 'boolean', 'slug'),
            new Column(Lang.get('generic.status'), 'boolean', 'status')
        ]));

        this.tenantList.setOnClick((index, tenant) => {
            Router.route(`/admin/page/tenant/edit/${tenant.slug}`);
        });
        this.append(this.tenantList.getContent());

        this.addTitleButton(new FormButton('','icon icon-plus-lg','/admin/page/tenant/new'))
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
