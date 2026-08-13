import { Auth } from './auth';
import { Page } from '../page-components/page';

export interface Route {
    path: string;
    page: typeof Page;
    authenticated?: boolean;
    routes?: Route[];
}

export interface RouteExtended extends Route {
    routes?: RouteExtended[];
    pageComponent?: Page | null;
    pageComponentChild?: Page | null;
    parent: RouteExtended | null;
    child: RouteExtended | null;
    urlParams?: { [key: string]: string };
    dataParams?: { [key: string]: string } | null;
    parentPath?: string;
    subPath?: string;
}

export class Router {
    static #base: string = '';
    static #tenantSlug: string = '';
    static #homeUrl: string = '/';
    static #loginUrl: string | undefined = undefined;

    static basePath: string = '';
    static routes: RouteExtended[] = [];
    static #currentRoute: RouteExtended | null = null;
    static lastParams: Map<string, string> | null = null;

    static #routerOutlet: HTMLElement | null = document.getElementById('router-outlet');

    static setBase(base: string) {
        let baseTag = document.querySelector('base');
        if (!baseTag) {
            baseTag = document.createElement('base');
            document.head.appendChild(baseTag);
        }

        baseTag.href = base;

        if (base.slice(-1) === '/') {
            base = base.slice(0, -1);
        }
        try {
            const url = new URL(base);
            Router.basePath = url.pathname;

        } catch (e) {
            Router.basePath = base;
        }

        Router.#base = !base ? '' : base;
    }

    static get base() {
        return Router.#base;
    }

    static setTenant() {
        let path = window.location.pathname;
        if (path.startsWith(Router.#base)) {
            path = path.substring(Router.#base.length);
        }

        if (path.startsWith('/')) {
            path = path.substring(1);
        }

        const segments = path.split('/');

        if (!segments[0] || segments[0].length == 0) {
            throw new Error('No tenant in path');
        }

        Router.#tenantSlug = segments[0];
    }

    static get tenantSlug() {
        return Router.#tenantSlug;
    }

    /**
     * A list of objects with the following parameters:
     * - path: The path that is after the tenant-base ,
     * - page: A javascript class that extends the Page base class,
     * - authenticated: A boolean value that tells if the a user needs to be logged in.
     * - routes: a list of objects consisting of:
     *      - path: The path that is after the tenant-base ,
     *      - page: A javascript class that extends the Page base class
     *    Sub-pages inherit the authenticated value from their parent.
     */
    static get tenantPath() {
        return Router.#base + '/' + Router.#tenantSlug;
    }

    static register(routes: Route[]) {
        for (const route of routes) {
            const currentRoute: RouteExtended = {
                ...route,
                routes: route.routes ? route.routes.map(subRoute => ({
                    path: subRoute.path,
                    page: subRoute.page,
                    authenticated: subRoute.authenticated,
                    urlParams: {},
                    dataParams: {},
                    parent: null, child: null
                })) : undefined,
                parent: null,
                child: null
            }
            Router.registerRoute(currentRoute);
        }
    }

    /**
     * @param {*} path - the pattern of the path by which the pageComponentDefinition is registered
     * @param {Page} pageComponentDefinition - A class that implements Page
     */
    static registerRoute(currentRoute: RouteExtended) {
        let register = true;

        if (currentRoute.routes) {
            for (const subRoute of currentRoute.routes) {
                const subPath = subRoute.path === '' ? '' : subRoute.path.startsWith('/') ? subRoute.path : '/' + subRoute.path;
                
                const fullPath = currentRoute.path.endsWith('/') ? currentRoute.path.slice(0, -1) + subPath : currentRoute.path + subPath;

                if (currentRoute.path === fullPath) {
                    register = false;
                }

                const childRoute: RouteExtended = {
                    ...subRoute,
                    path: fullPath,
                    parent: currentRoute,
                    child: subRoute
                }
                Router.registerRoute(childRoute);
            }
        } else {
            currentRoute.path = `/${Router.#tenantSlug}${currentRoute.path}`;
        }

        if (register) {
            Router.routes.push(currentRoute);
        }
    }

    /**
     * Routes to the given path if it has a registered pageComponentDefinition
     * @param {string} path 
     */
    static route(path: string, dataParams: any = {}) {
        if (!path) {
            return;
        }

        const isObject = dataParams !== null && typeof dataParams === 'object';
        const params = dataParams instanceof Map
            ? dataParams
            : new Map(!isObject ? [] : Object.entries(dataParams ?? {}))

        if (path.startsWith(Router.basePath)) {
            path = path.slice(Router.basePath.length) || "/";
        }

        if (!path.startsWith(`/${Router.#tenantSlug}`)) {
            path = `/${Router.#tenantSlug}${path}`;
        }

        const currentRoute = Router.matchRoute(path, dataParams);
        if (!currentRoute) {
            Router.#currentRoute = null;
            if (Router.#routerOutlet) {
                Router.#routerOutlet.innerHTML = `<h1>404 Not Found</h1><p>No route found for ${path}</p>`;
            }

        } else if (currentRoute.authenticated && !Auth.isAuthenticated()) {
            Router.login();
            return;
        }


        if (window.location.pathname !== path) {
            window.history.pushState({}, '', Router.basePath + path);
        }

        if (!currentRoute) {
            return;
        }

        if (!Router.#routerOutlet) {
            return;
        }

        const currentRouteHasChanged = currentRoute.page !== Router.#currentRoute?.page;
        const parentHasChanged = currentRoute.parent && currentRoute.parent?.page !== Router.#currentRoute?.parent?.page;

        if (currentRoute.parent) {
            Router.#destroyComponent(Router.#currentRoute, 'pageComponentChild');
            // 
            if (parentHasChanged) {
                Router.#destroyComponent(Router.#currentRoute, 'pageComponent');

                Router.#currentRoute = currentRoute;
                Router.#currentRoute.pageComponent = new currentRoute.parent.page();
                Router.#routerOutlet.innerHTML = '';
                Router.#routerOutlet.append(Router.#currentRoute.pageComponent.getContent());
                Router.#currentRoute.pageComponent.afterInit();
            } else {
                const pageComponent = Router.#currentRoute?.pageComponent;
                Router.#currentRoute = currentRoute;
                Router.#currentRoute.pageComponent = pageComponent;
                // No need to recreate
            }


            Router.#currentRoute.pageComponentChild = new Router.#currentRoute.page();
            Router.#currentRoute?.pageComponent?.renderSubView(Router.#currentRoute.pageComponentChild);

        } else if (currentRouteHasChanged) {
            Router.#destroyComponent(Router.#currentRoute, 'pageComponentChild');
            Router.#destroyComponent(Router.#currentRoute, 'pageComponent');

            Router.#currentRoute = currentRoute;
            Router.#currentRoute.pageComponent = new currentRoute.page();
            Router.#routerOutlet.innerHTML = '';
            Router.#routerOutlet.append(Router.#currentRoute.pageComponent.getContent());
            Router.#currentRoute.pageComponent.afterInit();
        }
    }

    static #destroyComponent(route: RouteExtended | null, property: string) {
        if (!route) {
            return;
        }

        const dynamicRoute = route as any;

        if (dynamicRoute[property]) {
            if (typeof dynamicRoute[property].destroy === 'function') {
                dynamicRoute[property].destroy();
            }

            dynamicRoute[property] = undefined;
        }
    }

    static matchRoute(currentPath: string, dataParams = null): RouteExtended | null {
        for (const { path, page, authenticated, parent, child } of Router.routes) {
            const matchParams = Router.#getRouteMatchParams(path, currentPath);

            if (matchParams) {

                // Creates a new object with the matched route and its parameters,
                // including parent and child routes if applicable
                const currentRoute: RouteExtended = {
                    urlParams: matchParams,
                    dataParams: dataParams,
                    path,
                    page,
                    parent,
                    child,
                    authenticated
                }

                if (parent) {

                    let parentPath = '/' + Router.tenantSlug + parent.path;

                    Object.keys(matchParams).forEach(key => {
                        parentPath = parentPath.replace(':' + key, matchParams[key]);
                    });

                    const subPath = currentPath.substring(parentPath.length);

                    

                    currentRoute.parentPath = parentPath;
                    currentRoute.subPath = subPath;
                } else {
                    currentRoute.parentPath = currentPath;
                    currentRoute.subPath = '';
                }

                return currentRoute;
            }
        }

        return null;
    }

    static setHome(homeUrl: string) {
        Router.#homeUrl = homeUrl;
    }

    static home() {
        Router.route(Router.#homeUrl);
    }

    static setLogin(loginUrl: string) {
        if (loginUrl) {
            Router.#loginUrl = loginUrl;
        }
    }

    static isLogin(path: string) {
        return window.location.pathname == Router.tenantPath + Router.#loginUrl;
    }

    static login() {
        if (Router.#loginUrl) {
            Router.route(Router.#loginUrl);
        }
    }

    static hasUrlParameter(param: string) {
        return param in (Router.#currentRoute?.urlParams ?? {});
    }

    static getUrlParameter(param: string) {
        return Router.#currentRoute?.urlParams?.[param];
    }

    static hasDataParameter(param: string) {
        return param in (Router.#currentRoute?.dataParams ?? {});
    }

    static getDataParameter(param: string) {
        return Router.#currentRoute?.dataParams?.[param];
    }

    static getCurrentRoute(): Readonly<RouteExtended | null> {
        const route = Router.#currentRoute;
        if (!route) {
            return null;
        }

        return Object.freeze({ ...route });
    }

    /**
     * Returns a map of params with key/value if there is a match. Otherwise it returns null
     * 
     * @param {*} routePath 
     * @param {*} currentPath 
     * @returns 
     */
    static #getRouteMatchParams(routePath: string, currentPath: string): { [key: string]: string } | null {
        const paramNames: string[] = [];
        const regexPattern = routePath.replace(/:([^/]+)/g, (_, paramName) => {
            paramNames.push(paramName);
            return '([^/]+)';
        });

        const regex = new RegExp('^' + regexPattern + '$');
        const match = currentPath.match(regex);

        if (!match)
            return null;

        const params: { [key: string]: string } = {};
        paramNames.forEach((name, i) => {
            params[name] = match[i + 1];
        });

        return params;
    }
}
