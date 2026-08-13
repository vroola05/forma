import { FormButton } from '../../../shared/form-components/components/form-button';
import { Column, List, ListDefinition } from '../../../shared/generic-components/list';
import { USER_STATUS } from '../../../shared/model/types';
import { Http } from '../../../shared/services/http';
import { Lang } from '../../../shared/services/lang';
import { Router } from '../../../shared/services/router';
import { SettingsPage } from '../settings-page';

export class UserPage extends SettingsPage {
    usersList: List;

    constructor() {
        super(Lang.get('user.title'));
        
        this.usersList = new List(new ListDefinition([
            new Column(Lang.get('generic.name'), 'text', 'name'),
            new Column(Lang.get('generic.email'), 'text', 'email'),
            new Column(Lang.get('generic.status'), 'text', 'status')
        ]));

        this.usersList.setOnClick((index, user) => {
            Router.route(`/admin/page/users/${user.id}`);
        });
        this.append(this.usersList.getContent());

        this.addTitleButton(new FormButton('','icon icon-plus-lg','/admin/page/users/new'))
    }

    afterInit() {
        Http.get(`${Router.tenantPath}/api/users/list`, {})
        .then((users: any) => {
            this.usersList.setData(users.map((u: any) => ({
                id: u.id,
                name: u.name,
                email: u.email,
                status: !u.status ? '' : USER_STATUS[u.status]()
            })));
        })
        .catch((error) => {
            console.error(error);
        });
    }
    
}
