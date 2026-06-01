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

export class GroupPage extends SettingsPage {

    constructor() {
        super(Lang.get('group.title'));
        
        this.createContent();

        this.addTitleButton(new FormButton('','icon icon-plus-lg','/admin/page/groups/new'))
    }

    createContent() {
        this.groupList = new List(new ListDefinition([
            new Column('Name', 'text', 'name'),
            new Column('Status', 'boolean', 'status')
        ]));

        this.groupList.setOnClick((index, group) => {
            Router.route(`/admin/page/groups/edit/${group.id}`);
        });
        this.append(this.groupList.getContent());

    }

    afterInit() {
        Http.get(`${Router.tenantPath}/api/groups/list`, {})
        .then((groups) => {
            this.groupList.setData(groups);
        })
        .catch((error) => {
            console.error(error);
        });
    }
    
}
