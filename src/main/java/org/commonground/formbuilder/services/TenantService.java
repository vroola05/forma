package org.commonground.formbuilder.services;

import org.commonground.formbuilder.model.settings.Tenant;

public interface TenantService {
    
    public Tenant get(String tenantSlug);
    public void save(Tenant tenant);
}
