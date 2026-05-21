import { Router } from './shared/services/router.js';
import { Environment } from './environment.js';
import { Header } from './shared/generic-components/header.js';
import { Footer } from './shared/generic-components/footer.js';
import { EventService } from './shared/services/event-service.js';

import { Auth } from './auth.js';
import { Lang } from './shared/services/lang.js';
import { TenantService } from './shared/services/tenant-service.js';
import { Http } from './shared/services/http.js';
import { headerService } from './shared/services/header-service.js';


export class Main {
    // auth = new Auth();
    #routes = [];

    constructor(routes = [], baseAddition = undefined, homeUrl = undefined, loginUrl = undefined) {
        this.#routes = routes;
        
        this.setBase(baseAddition);

        Router.setHome(homeUrl);
        Router.setLogin(loginUrl);

        TenantService.load()
            .then((tenant) => {
                this.onTenantLoaded(tenant);
            })
            .catch((error) => {
                console.error(error);
            });
    }

    onTenantLoaded(tenant) {
        for (const route of this.#routes) {
            Router.registerRoute(route.path, route.page, route.routes);
        }

        // const header = new Header();
        // const headerDom = document.getElementById('header');
        // headerDom.appendChild(header.getContent());

        // const footer = new Footer();
        // const footerDom = document.getElementById('footer');
        // footerDom.appendChild(footer.getContent());
        if (Router.tenantSlug && Router.tenantSlug !== 'system') {
            console.log('Setting header tenant logo', `${Router.tenantSlug}/api/tenant/logo`);
            headerService.setLogo(`${Router.tenantPath}/api/tenant/logo`);
        }
        headerService.setLogo(`${Router.tenantPath}/api/tenant/logo`);

        Lang.load().then(() => {
            Http.get(`${Router.tenantPath}/api/authenticated`).then(a => {
                this.setRoute();
            })
            .catch(() => {});
        });
    }

    setBase(baseAddition) {
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
    }

    setRoute() {
        window.addEventListener('popstate', () => {
            Router.route(window.location.pathname);
        });
        if (Router.isLogin(window.location.pathname)) {
            Router.home();
        } else {
            Router.route(window.location.pathname);
        }
        
    }
}

window.Main = Main;
