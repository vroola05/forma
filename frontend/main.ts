import './src/assets/css/fonts/icons.css';
import './src/assets/css/styles.css';
import './src/assets/css/styles-viewer.css';


import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';


import { Forma } from './src/forma';
import { FormPage } from './src/form-viewer/page-components/form-page';
import { SuccessPage } from './src/form-viewer/page-components/success-page';

export class Main {
    constructor() {
        new Forma({
            routes: [
                {'path': '/page/form/:formName', 'page': FormPage},
                {'path': '/page/form/:formName/tab/:tabName', 'page': FormPage},
                {'path': '/page/form/:formName/success', 'page': SuccessPage}
            ],
            homeUrl: '/admin'
        });
    }
}

new Main();