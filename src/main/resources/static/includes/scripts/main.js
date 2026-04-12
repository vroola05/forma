import { Router } from './shared/services/router.js';
import { Environment } from './environment.js';
import { Header } from './form-viewer/components/header.js';
import { Footer } from './shared/generic-components/footer.js';


import { Auth } from './auth.js';
import { Lang } from './shared/services/lang.js';

export class Main {

    auth = new Auth();
    routes = [];

    constructor(routes = [], baseAddition = undefined) {

        this.routes = routes;
        if (baseAddition) {
            if (baseAddition.charAt(0) === '/') {
                baseAddition.slice(0, 1);
            }

            if (baseAddition.slice(-1) !== '/') {
                baseAddition += '/';
            }

            Environment.base += baseAddition;
        }

        Router.setBase(Environment.base);

        Lang.load().then(() => {

            const header = new Header();
            const headerDom = document.getElementById('header');
            headerDom.appendChild(header.getContent());

            const footer = new Footer();
            const footerDom = document.getElementById('footer');
            footerDom.appendChild(footer.getContent());

            this.setRoutes();
        });
    }

    setRoutes() {
        for (const route of this.routes) {
            Router.registerRoute(route.path, route.page, route.routes);
        }
        
        window.addEventListener('popstate', () => {
            Router.route(window.location.pathname);
        });
        Router.route(window.location.pathname);
    }
}
window.Main = Main;
