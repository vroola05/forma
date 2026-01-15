
export class Router {
    static base = '';
    static basePath = '';
    static routes = []
    static lastParams = null;
    static content = document.getElementById('content');

    static registerRoute(pattern, page) {
        
        Router.routes.push({ pattern, page });
    }

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

        Router.base = base
    }

    static extractRouteParams(pattern, path) {
        const paramNames = [];
        const regexPattern = pattern.replace(/:([^/]+)/g, (_, paramName) => {
            paramNames.push(paramName);
            return '([^/]+)';
        });
        const regex = new RegExp('^' + regexPattern + '$');
        const match = path.match(regex);
        if (!match) return null;

        const params = {};
        paramNames.forEach((name, i) => {
            params[name] = match[i + 1];
        });
        return params;
    }

    static matchRoute(path) {
        for (const { pattern, page } of Router.routes) {
            const params = Router.extractRouteParams(pattern, path);
            if (params) {
                Router.lastParams = params; // Sla de params globaal op
                return page;           // Return het object dat je bij registerRoute meegaf
            }
        }
        Router.lastParams = null;
        return null;
    }

    static route(path) {
        if (path.startsWith(Router.basePath)) {
            path = path.slice(Router.basePath.length) || "/";
        }
        const pageClass = Router.matchRoute(path);
        
        if (pageClass) {
            if (window.location.pathname !== path) {
                window.history.pushState({}, '', Router.basePath + path);
            }

            if (!this.currentPage || this.currentPage.constructor !== pageClass) {
                this.currentPage = new pageClass();
                content.innerHTML = '';
                content.append(this.currentPage.getContent());
                
                this.currentPage.afterInit();
            }
            
            
        } else {
            content.innerHTML = `<h1>404 Not Found</h1><p>No route found for ${path}</p>`;
        }
    }
}
