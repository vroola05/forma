
import { Http } from './http';
import { Router } from './router';
import { TenantDto } from '../model/types';

export class TenantService {
    static #tenant: TenantDto | undefined = undefined;

    constructor() {
    }

    static load(): Promise<TenantDto> {
        Router.setTenant();
        return Http.get(`${Router.tenantPath}/api/tenant`, {})
            .then((tenant: TenantDto) => {
                
                if (!tenant) {
                    throw new Error('No tenant found');
                }
                TenantService.#configureTenant(tenant);

                return TenantService.#tenant as TenantDto;
            });
    }

    static get tenant() {
        return TenantService.#tenant;
    }

    static #configureTenant(tenant: TenantDto) {
        TenantService.#tenant = Object.freeze(tenant);

        if (tenant.primaryColor) {
            document.documentElement.style.setProperty('--primary-color', tenant?.primaryColor);
        }
        if (tenant.secondaryColor) {
            document.documentElement.style.setProperty('--secondary-color', tenant?.secondaryColor);
        }

    }
}