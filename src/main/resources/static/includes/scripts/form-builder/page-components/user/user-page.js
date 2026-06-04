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
import { USER_STATUS } from '../../../shared/model/form-data.js';

export class UserPage extends SettingsPage {

    constructor() {
        super(Lang.get('user.title'));
        
        this.createContent();

        this.addTitleButton(new FormButton('','icon icon-plus-lg','/admin/page/users/new'))
    }

    createContent() {
        this.usersList = new List(new ListDefinition([
            new Column(Lang.get('generic.name'), 'text', 'name'),
            new Column(Lang.get('generic.email'), 'text', 'email'),
            new Column(Lang.get('generic.status'), 'text', 'status')
        ]));

        this.usersList.setOnClick((index, user) => {
            Router.route(`/admin/page/users/${user.id}`);
        });
        this.append(this.usersList.getContent());

    }

    afterInit() {
        Http.get(`${Router.tenantPath}/api/users/list`, {})
        .then((users) => {
            this.usersList.setData(users.map(u => ({name: u.name, email: u.email, status: !u.status ? '' : USER_STATUS[u.status]()})));
        })
        .catch((error) => {
            console.error(error);
        });
    }
    
}
