import { FormButton } from '../../../shared/form-components/components/form-button';
import { Column, List, ListDefinition } from '../../../shared/generic-components/list';
import { Http } from '../../../shared/services/http';
import { Lang } from '../../../shared/services/lang';
import { Router } from '../../../shared/services/router';
import { SettingsPage } from '../settings-page';

export class IdentityProviderPage extends SettingsPage {
    list: List;
    constructor() {
        super(Lang.get('generic.btn.idp'));
        
        this.list = new List(new ListDefinition([
            new Column(Lang.get('generic.name'), 'text', 'displayName')
        ]));
        this.list.setOnClick((index, idp) => {
            Router.route(`/admin/page/identity-providers/${idp.id}`);
        });
        this.append(this.list.getContent());

        this.addTitleButton(new FormButton('', 'icon icon-plus-lg', '/admin/page/identity-providers/new'));
    }

    afterInit() {
        Http.get(`${Router.tenantPath}/api/idp/list`, {})
                .then((idp) => {
                    this.list.setData(idp);
                })
                .catch((error) => {
                    console.error(error);
                });
    }
    
}
