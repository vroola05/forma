import { Observable } from './observable.js';

class AuthService {
    #userObservable = new Observable(null);
    #permissions = new Map();

    setUser(userData) {
        this.#permissions.clear();

        for (const [key, value] of Object.entries(userData?.permissions || {})) {
            this.#permissions.set(value, value);
        }
        console.log('permissions', this.#permissions);

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
}

export const Auth = new AuthService();
