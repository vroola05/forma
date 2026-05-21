package org.commonground.formbuilder.services;

import java.util.List;
import java.util.UUID;

import org.commonground.formbuilder.database.dao.settings.TenantEntity;
import org.commonground.formbuilder.model.settings.Tenant;

public interface TenantService {
    
    public List<Tenant> getAll();
    public TenantEntity get(UUID id);
    public Tenant get(String tenantSlug);
    public Tenant save(Tenant tenant);
    public TenantEntity save(TenantEntity tenantEntity);
}
