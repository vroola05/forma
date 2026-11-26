package org.commonground.forma.services;

import java.util.List;
import java.util.UUID;

import org.commonground.forma.database.dao.settings.TenantAuthProviderEntity;
import org.commonground.forma.model.form.idp.FormAuthProvider;
import org.commonground.forma.model.form.idp.TenantAuthProvider;

public interface IdpService {
    public List<TenantAuthProvider> getAll(UUID tenantId);
    public TenantAuthProvider get(UUID tenantId, UUID id);
    public List<TenantAuthProviderEntity> getFormTenantAuthProviderEntities(UUID tenantId);
    public List<FormAuthProvider> getFormIdps(UUID tenantId);
    public FormAuthProvider getFormIdp(UUID tenantId, UUID id);
    public TenantAuthProvider createAuthProvider(UUID tenantId, TenantAuthProvider authProvider);
    public TenantAuthProvider updateAuthProvider(UUID tenantId, TenantAuthProvider authProvider);
    
}
