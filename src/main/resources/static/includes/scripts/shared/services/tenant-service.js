
import { Http } from './http.js';
import { Router } from './router.js';
import { Tenant } from '../model/form-data.js';

export class TenantService {
    static #tenant = {};

    constructor() {
    }

    static load() {

        return new Promise((resolve, reject) => {
            try {
                Router.setTenant();
            } catch (error) {
                reject(error);
            }
            Http.get(`${Router.tenantPath}/api/tenant`, {})
                .then(tenant => {
                    if (tenant) {
                        TenantService.#configureTenant(tenant);
                        resolve(TenantService.#tenant);
                    }
                    reject(new Error('No tenant found'));
                })
                .catch((error) => {
                    reject(error);
                });
        });
    }

    static get tenant() {
        return TenantService.#tenant;
    }

    static #configureTenant(tenant) {
        TenantService.#tenant = Object.freeze(new Tenant(tenant));

        document.documentElement.style.setProperty('--primary-color', TenantService.#tenant.primaryColor);
        document.documentElement.style.setProperty('--secondary-color', TenantService.#tenant.secondaryColor);

    }
}