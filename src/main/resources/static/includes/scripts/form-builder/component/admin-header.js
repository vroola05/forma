import { Router } from '../../shared/services/router.js';
import { Http } from '../../shared/services/http.js';
import { EventService } from '../../shared/services/event-service.js';
import { Lang } from '../../shared/services/lang.js';
import { FormButton } from '../../shared/form-components/components/form-button.js';
import { Header } from '../../shared/generic-components/header.js';
import { PERMISSIONS } from '../../shared/model/form-data.js';
import { Auth } from '../../shared/services/auth.js';

export class AdminHeader extends Header {
    
    constructor() {
        super();
        EventService.emit('header-buttons-left', [
            new FormButton(Lang.get('forms.title'), null, '/admin/page/forms').setPermissions([PERMISSIONS.FORM_READ]),
            new FormButton(Lang.get('tenant.title'), null, '/admin/page/tenant').setPermissions([PERMISSIONS.TENANT_READ_INTERNAL]),
            new FormButton(Lang.get('group.title'), null, '/admin/page/groups').setPermissions([PERMISSIONS.GROUP_READ]),
            new FormButton(Lang.get('user.title'), null, '/admin/page/users').setPermissions([PERMISSIONS.USER_READ])


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
