package org.commonground.forma.config.tenant;

import org.commonground.forma.model.settings.Tenant;

public class TenantContext {
    private static final ThreadLocal<Tenant> CURRENT_TENANT_SLUG = new ThreadLocal<>();

    public static void setTenant(Tenant tenant) { CURRENT_TENANT_SLUG.set(tenant); }
    public static Tenant getTenant() { return CURRENT_TENANT_SLUG.get(); }
    public static void clear() { CURRENT_TENANT_SLUG.remove(); }
}
