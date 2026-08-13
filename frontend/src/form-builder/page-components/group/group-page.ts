import { SettingsPage } from '../settings-page';
import { Http } from '../../../shared/services/http';
import { Router } from '../../../shared/services/router';
import { Lang } from '../../../shared/services/lang';
import { TextField } from '../../../shared/form-components/text-field';
import { PasswordField } from '../../../shared/form-components/password-field';
import { FormButton } from '../../../shared/form-components/components/form-button';
import { AdminHeader } from '../../component/admin-header';
import { Column, List, ListDefinition } from '../../../shared/generic-components/list';
import { EventService } from '../../../shared/services/event-service';

export class GroupPage extends SettingsPage {
    groupList: List;

    constructor() {
        super(Lang.get('group.title'));
        
        this.groupList = new List(new ListDefinition([
            new Column(Lang.get('generic.name'), 'text', 'name')
        ]));

        this.groupList.setOnClick((index, group) => {
            Router.route(`/admin/page/groups/${group.id}`);
        });
        this.append(this.groupList.getContent());

        this.addTitleButton(new FormButton('', 'icon icon-plus-lg', '/admin/page/groups/new'));
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
