import { UserDto } from '../model/types';
import { Http } from './http';
import { Observable } from './observable';
import { Router } from './router';

class AuthService {
    #userObservable = new Observable<UserDto | null>(null);
    #permissions = new Map<string, string>();

    setUser(user: UserDto) {
        this.#permissions.clear();

        for (const [key, value] of Object.entries(user?.permissions || {})) {
            this.#permissions.set(value, value);
        }

        this.#userObservable.value = user;
    }

    isAuthenticated() {
        return this.#userObservable.value !== null;
    }

    getUser() {
        return this.#userObservable.value;
    }

    hasAnyPermission(...permissions: string[]) {
        return permissions.some(p => this.#permissions.has(p));
    }

    hasPermissions(...permissions: string[]) {
        return permissions.every(p => this.#permissions.has(p));
    }

    clear() {
        this.#permissions.clear();
        this.#userObservable.value = null;
    }

    logout() {
        Http.post(Router.tenantPath + '/api/logout', null).then(() => {
            localStorage.clear();
            sessionStorage.clear();
        
            Router.login();
        }).catch(() => {});
        this.clear();
    }
}

export const Auth = new AuthService();
