import { Environment } from './environment';
import { Toast } from './shared/generic-components/toast';
import { TenantDto } from './shared/model/types';
import { Auth } from './shared/services/auth';
import { headerService } from './shared/services/header-service';
import { Http } from './shared/services/http';
import { Lang } from './shared/services/lang';
import { Route, Router } from './shared/services/router';
import { TenantService } from './shared/services/tenant-service';

export interface FormaOptions {
    routes: Route[];
    baseAddition?: any;
    homeUrl?: string;
    loginUrl?: string;
}

export class Forma {
    constructor(options: FormaOptions) {
        const toast = new Toast();
        const toastOutlet = document.getElementById('toast-outlet');
        if (toastOutlet) {
            toastOutlet.append(toast.getContent());
        }

        
        
        this.setBase(options.baseAddition);

        if (options.homeUrl) {
            Router.setHome(options.homeUrl);
        }
    
        if (options.loginUrl) {
            Router.setLogin(options.loginUrl);
        }

        TenantService.load()
            .then((tenant: TenantDto) => {
                this.onTenantLoaded(tenant, options.routes);
            })
            .catch((error) => {
                console.error(error);
            });
    }

    onTenantLoaded(tenant: TenantDto, routes: Route[]) {
        Router.register(routes);

        if (Router.tenantSlug && tenant.hasLogo) {
            if ( Router.tenantSlug !== 'system') {
                headerService.setLogo(`${Router.tenantPath}/api/tenant/logo`);
            } else {
                // headerService.setLogo(`${Router.tenantPath}/api/tenant/logo`);
            }
        }

        Lang.load().then(() => {
            this.addRouteListener();

            Http.get(`${Router.tenantPath}/api/users/me`).then(user => {
                Auth.setUser(user);
            })
            .catch((error: any) => {

            })
            .finally(() => {
                this.setRoute();
            });
        }).catch(() => {});
    }

    setBase(baseAddition: string | undefined) {
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

    addRouteListener() {
        window.addEventListener('popstate', () => {
            Router.route(window.location.pathname);
        });
    }

    setRoute() {
        // setRoute() is called after the user is loged in. If the login path is beeing entered while logged in
        // Navigate home
        if (Router.isLogin(window.location.pathname)) {
            Router.home();
        } else {
            Router.route(window.location.pathname);
        }
        
    }
}
