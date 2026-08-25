
import '../src/assets/css/fonts/icons.css';
import '../src/assets/css/styles.css';
import '../src/assets/css/styles-builder.css';

import 'bootstrap/dist/css/bootstrap.min.css';

import 'bootstrap';

import '../src/shared/form-components/interface/input-base';
import '../src/shared/form-components/interface/nucleus';

import { Forma } from '../src/forma';
import { LoginPage } from '../src/form-builder/page-components/login/login-page';
import { DashboardPage } from '../src/form-builder/page-components/dashboard/dashboard-page';
import { TenantPage } from '../src/form-builder/page-components/tenant/tenant-page';
import { TenantPageNew } from '../src/form-builder/page-components/tenant/tenant-page-new';
import { TenantPageEdit } from '../src/form-builder/page-components/tenant/tenant-page-edit';
import { TenantPageCustomise } from '../src/form-builder/page-components/tenant/tenant-page-customise';

import { GroupPage } from '../src/form-builder/page-components/group/group-page';
import { GroupPageEdit } from '../src/form-builder/page-components/group/group-page-edit';

import { UserPage } from '../src/form-builder/page-components/user/user-page';
import { UserPageEdit } from '../src/form-builder/page-components/user/user-page-edit';

import { BuilderPage } from '../src/form-builder/page-components/builder/builder-page';
import { FormDashboard } from '../src/form-builder/page-components/builder/form-dashboard-page';
import { BuilderPageSettingsForm } from '../src/form-builder/page-components/builder/builder-page-settings-form';
import { BuilderPageSettingsGeneric } from '../src/form-builder/page-components/builder/builder-page-settings-generic';
import { BuilderPageSettingsLogin } from '../src/form-builder/page-components/builder/builder-page-settings-login';
import { BuilderPageSettingsMail } from '../src/form-builder/page-components/builder/builder-page-settings-mail';
import { BuilderPageSettingsPayment } from '../src/form-builder/page-components/builder/builder-page-settings-payment';
import { BuilderPageSettingsRegistration } from '../src/form-builder/page-components/builder/builder-page-settings-registration';
import { BuilderPageSettingsSuccess } from '../src/form-builder/page-components/builder/builder-page-settings-success';
import { FormSettingsGenericSuccessPage } from '../src/form-builder/page-components/form-settings/form-settings-generic-success-page';

export class Main {
    constructor() {
        new Forma({
            routes: [
                {'path': '/admin', 'page': DashboardPage, 'authenticated': true},
                {'path': '/admin/page/login', 'page': LoginPage},
                {'path': '/admin/page/tenant', 'page': TenantPage, 'authenticated': true},
                {'path': '/admin/page/tenant/customise', 'page': TenantPageCustomise, 'authenticated': true},
                {'path': '/admin/page/tenant/new', 'page': TenantPageNew, 'authenticated': true},
                {'path': '/admin/page/tenant/edit/:slug', 'page': TenantPageEdit, 'authenticated': true},
                {'path': '/admin/page/groups', 'page': GroupPage, 'authenticated': true},
                {'path': '/admin/page/groups/:id', 'page': GroupPageEdit, 'authenticated': true},
                {'path': '/admin/page/users', 'page': UserPage, 'authenticated': true},
                {'path': '/admin/page/users/:id', 'page': UserPageEdit, 'authenticated': true},
                {'path': '/admin/page/forms', 'page': FormDashboard, 'authenticated': true},
                {'path': '/admin/page/form-generic-successpage', 'page': FormSettingsGenericSuccessPage, 'authenticated': true},
                {'path': '/admin/page/forms/:formName', 'page': BuilderPage, 'authenticated': true,
                    'routes': [
                        {'path': '', 'page': BuilderPageSettingsGeneric},
                        {'path': '/settings-form', 'page': BuilderPageSettingsForm},
                        {'path': '/settings-login', 'page': BuilderPageSettingsLogin},
                        {'path': '/settings-mail', 'page': BuilderPageSettingsMail},
                        {'path': '/settings-success', 'page': BuilderPageSettingsSuccess},
                        {'path': '/settings-registration', 'page': BuilderPageSettingsRegistration},
                        {'path': '/settings-payment', 'page': BuilderPageSettingsPayment},
                    ]

                }
            ],
            homeUrl: '/admin',
            loginUrl: '/admin/page/login'
        });
    }
}
new Main();