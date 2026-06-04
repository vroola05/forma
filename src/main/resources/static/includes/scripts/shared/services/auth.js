import { Observable } from './observable.js';
import { Router } from './router.js';
import { Http } from './http.js';

class AuthService {
    #userObservable = new Observable(null);
    #permissions = new Map();

    setUser(userData) {
        this.#permissions.clear();

        for (const [key, value] of Object.entries(userData?.permissions || {})) {
            this.#permissions.set(value, value);
        }

        this.#userObservable.value = userData;
    }

    isAuthenticated() {
        return this.#userObservable.value !== null;
    }

    getUser() {
        return this.#userObservable.value;
    }

    hasAnyPermission(...permissions) {
        return permissions.some(p => this.#permissions.has(p));
    }

    hasPermissions(...permissions) {
        return permissions.every(p => this.#permissions.has(p));
    }

    clear() {
        this.#permissions.clear();
        this.#userObservable.value = null;
    }

    logout() {
        Http.post(Router.tenantPath + '/api/logout').then(() => {
            localStorage.clear();
            sessionStorage.clear();
        
            Router.login();
        });
        this.clear();
    }
}

export const Auth = new AuthService();
