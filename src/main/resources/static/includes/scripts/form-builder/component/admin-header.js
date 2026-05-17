import { Router } from '../../shared/services/router.js';
import { EventService } from '../../shared/services/event-service.js';
import { Lang } from '../../shared/services/lang.js';
import { FormButton } from '../../shared/form-components/components/form-button.js';
import { Header } from '../../shared/generic-components/header.js';

export class AdminHeader extends Header {
    
    constructor() {
        super();
        EventService.callEventListener('header-buttons-left', [
            new FormButton('Formulieren', null, '/admin/page/form/overview'),
            new FormButton('Tenants', null, '/admin/page/tenant')

        ]);

        EventService.callEventListener('header-buttons-right', [
            new FormButton('Instellingen', null, '/admin/page/form/overview')
        ]);
    }

}
