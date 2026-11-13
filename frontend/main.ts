import './src/assets/css/fonts/icons.css';
import './src/assets/css/styles-viewer.css';
import './src/assets/css/styles.css';

import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

import { FormLoginPage } from './src/form-viewer/page-components/form-login-page';
import { FormPage } from './src/form-viewer/page-components/form-page';
import { SuccessPage } from './src/form-viewer/page-components/success-page';
import { Forma } from './src/forma';

export class Main {
    constructor() {
        new Forma({
            routes: [
                {'path': '/page/form/:formName/login', 'page': FormLoginPage},
                {'path': '/page/form/:formName', 'page': FormPage},
                {'path': '/page/form/:formName/tab/:tabName', 'page': FormPage},
                {'path': '/page/form/:formName/success', 'page': SuccessPage}
            ],
            homeUrl: '/admin'
        });

    }
}

new Main();