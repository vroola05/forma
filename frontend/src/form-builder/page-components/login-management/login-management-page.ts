import { FormButton } from '../../../shared/form-components/components/form-button';
import { Lang } from '../../../shared/services/lang';
import { SettingsPage } from '../settings-page';

export class LoginManagementPage extends SettingsPage {

    constructor() {
        super(Lang.get('generic.auth.management'));
        
        this.addTitleButton(new FormButton('', 'icon icon-plus-lg', '/admin/page/groups/new'));
    }

    afterInit() {
        
    }
    
}
