
export class Router {
    static #base = '';
    static #tenantSlug = '';
    static #homeUrl = '/';
    static #loginUrl = '/';

    static basePath = '';
    static routes = []
    static #currentRoute = null;
    static lastParams = null;

    static #routerOutlet = document.getElementById('router-outlet');

    static setBase(base) {
        let baseTag = document.querySelector('base');
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

    static get tenantPath() {
        return  Router.#base + '/' + Router.#tenantSlug;
    }

    /**
     * 
     * @param {*} path - the pattern of the path by which the pageComponentDefinition is registered
     * @param {Page} pageComponentDefinition - A class that implements Page
     */
    static registerRoute(path, pageComponentDefinition, routes, parent = null, child = null) {
        
        const currentRoute = {
            path: `/${Router.#tenantSlug}${path}`,
            pageComponentDefinition: pageComponentDefinition,
            parent: parent,
            child: child
        };

        let register = true;

        if (routes) {
            for (const subRoute of routes) {
                const subPath = subRoute.path.startsWith('/') ? subRoute.path : '' + subRoute.path;
                const fullPath = path.endsWith('/') ? path.slice(0, -1) + subPath : path + subPath;
                
                if (path === fullPath) {
                    register = false;
                }

                Router.registerRoute(fullPath, subRoute.page, subRoute.routes, currentRoute, subRoute);
            }
        }

        if (register) {
            Router.routes.push(currentRoute);
        }
    }

    /**
     * Routes to the given path if it has a registered pageComponentDefinition
     * @param {string} path 
     */
    static route(path, dataParams = {}) {
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
        
        console.log('path', path, Router.#tenantSlug);
        if (!path.startsWith(`/${Router.#tenantSlug}`)) {
            path = `/${Router.#tenantSlug}${path}`;
        }

        const currentRoute = Router.matchRoute(path, dataParams);

        if (currentRoute) {
            if (window.location.pathname !== path) {
                window.history.pushState({}, '', Router.basePath + path);
            }
            if (currentRoute.parent) {
                if (currentRoute.parent?.pageComponentDefinition !== Router.#currentRoute?.parent?.pageComponentDefinition) {
                    Router.#currentRoute = currentRoute;
                    Router.#currentRoute.pageComponent = new currentRoute.parent.pageComponentDefinition();
                    Router.#routerOutlet.innerHTML = '';
                    Router.#routerOutlet.append(Router.#currentRoute.pageComponent.getContent());
                    Router.#currentRoute.pageComponent.afterInit();
                } else {
                    const pageComponent = Router.#currentRoute.pageComponent;
                    Router.#currentRoute = currentRoute;
                    Router.#currentRoute.pageComponent = pageComponent;
                }

                const page = new Router.#currentRoute.pageComponentDefinition();
                Router.#currentRoute.pageComponent.renderSubView(page);
                
                page.afterInit();


            } else if (currentRoute.pageComponentDefinition !== Router.#currentRoute?.pageComponentDefinition) {
                Router.#currentRoute = currentRoute;
                const page = new currentRoute.pageComponentDefinition();
                Router.#routerOutlet.innerHTML = '';
                Router.#routerOutlet.append(page.getContent());

                page.afterInit();
            }
        
            return;
        }

        Router.#currentRoute = null;
        Router.#routerOutlet.innerHTML = `<h1>404 Not Found</h1><p>No route found for ${path}</p>`;
    }

    static matchRoute(currentPath, dataParams = null) {
        for (const { path, pageComponentDefinition,  parent, child} of Router.routes) {
            const matchParams = Router.#getRouteMatchParams(path, currentPath);
            if (matchParams) {
                const currentRoute = {
                    urlParams: matchParams,
                    dataParams: dataParams,
                    path,
                    pageComponentDefinition,
                    parent,
                    child
                }

                if (parent) {
                    
                    let parentPath = parent.path;
                    
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

    static setHome(homeUrl) {
        Router.#homeUrl = homeUrl;
    }

    static home() {
        Router.route(Router.#homeUrl);
    }

    static setLogin(loginUrl) {
        Router.#loginUrl = loginUrl;
    }

    static isLogin(path) {
        return window.location.pathname == Router.tenantPath + Router.#loginUrl;
    }

    static login() {
        Router.route(Router.#loginUrl);
    }

    static hasUrlParameter(param) {
        return param in (Router.#currentRoute?.urlParams ?? {});
    }

    static getUrlParameter(param) {
        return Router.#currentRoute?.urlParams?.[param];
    }

    static hasDataParameter(param) {
        return param in (Router.#currentRoute?.dataParams ?? {});
    }

    static getDataParameter(param) {
        return Router.#currentRoute?.dataParams?.[param];
    }

    static getCurrentRoute() {
        return Object.freeze({ ...Router.#currentRoute });
    }

    /**
     * Returns a map of params with key/value if there is a match. Otherwise it returns null
     * 
     * @param {*} routePath 
     * @param {*} currentPath 
     * @returns 
     */
    static #getRouteMatchParams(routePath, currentPath) {
        const paramNames = [];
        const regexPattern = routePath.replace(/:([^/]+)/g, (_, paramName) => {
            paramNames.push(paramName);
            return '([^/]+)';
        });

        const regex = new RegExp('^' + regexPattern + '$');
        const match = currentPath.match(regex);

        if (!match)
            return null;

        const params = {};
        paramNames.forEach((name, i) => {
            params[name] = match[i + 1];
        });

        return params;
    }
}
