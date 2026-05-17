
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
                        TenantService.#tenant = Object.freeze(new Tenant(tenant));
                        resolve(TenantService.#tenant);
                    }
                    reject(new Error('No tenant found'));
                })
                .catch((error) => {
                    reject(error);
                });
        });
    }

}