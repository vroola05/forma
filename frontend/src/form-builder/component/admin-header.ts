import { FormButton } from '../../shared/form-components/components/form-button';
import { Dropdown } from '../../shared/generic-components/dropdown-menu';
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
            new Dropdown(Lang.get('page.settings.generic.forms'), [
                new FormButton(Lang.get('page.settings.generic.forms.successpage'), null, '/admin/page/form-generic-successpage').setPermissions(PERMISSION.FORM_READ)
            ]).setPermissions(PERMISSION.FORM_READ),
            new FormButton(Lang.get('tenant.title'), null, '/admin/page/tenant').setPermissions(PERMISSION.TENANT_READ_INTERNAL),

            new Dropdown(Lang.get('generic.auth.management'), [
                new FormButton(Lang.get('tenant.title'), null, '/admin/page/login-management').setPermissions(PERMISSION.LOGIN_MANAGEMENT_READ),
                
            ]).setPermissions(PERMISSION.LOGIN_MANAGEMENT_READ),
            new Dropdown(Lang.get('user.management'), [
                new FormButton(Lang.get('group.title'), null, '/admin/page/groups').setPermissions(PERMISSION.GROUP_READ),
                new FormButton(Lang.get('user.title'), null, '/admin/page/users').setPermissions(PERMISSION.USER_READ)
            ]).setPermissions(PERMISSION.GROUP_READ, PERMISSION.USER_READ),
            

        ]);

        EventService.emit('header-buttons-right', [
            new FormButton(Lang.get('generic.btn.profile'), null, '/admin/page/form'),
            new FormButton(Lang.get('generic.btn.tenant'), null, '/admin/page/tenant/customise'),
            new FormButton(Lang.get('generic.btn.logout'), null, null, () => {
                Auth.logout();
            })
        ]);
    }

}
