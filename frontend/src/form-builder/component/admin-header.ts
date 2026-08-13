import { FormButton } from '../../shared/form-components/components/form-button';
import { Header } from '../../shared/generic-components/header';
import { PERMISSION } from '../../shared/model/types';
import { Auth } from '../../shared/services/auth';
import { EventService } from '../../shared/services/event-service';
import { Lang } from '../../shared/services/lang';

export class AdminHeader extends Header {
    
    constructor() {
        super();
        EventService.emit('header-buttons-left', [
            new FormButton(Lang.get('builder.forms.title'), null, '/admin/page/forms').setPermissions(PERMISSION.FORM_READ),
            new FormButton(Lang.get('tenant.title'), null, '/admin/page/tenant').setPermissions(PERMISSION.TENANT_READ_INTERNAL),
            new FormButton(Lang.get('group.title'), null, '/admin/page/groups').setPermissions(PERMISSION.GROUP_READ),
            new FormButton(Lang.get('user.title'), null, '/admin/page/users').setPermissions(PERMISSION.USER_READ)


        ]);

        EventService.emit('header-buttons-right', [
            new FormButton('Profiel', null, '/admin/page/form'),
            new FormButton('Tenant instellingen', null, '/admin/page/tenant/customise'),
            new FormButton('Uitloggen', null, null, () => {
                Auth.logout();
            })
        ]);
    }

}
