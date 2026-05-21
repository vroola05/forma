package org.commonground.formbuilder.config.tenant;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.commonground.formbuilder.config.AppConstants;
import org.commonground.formbuilder.services.TenantService;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.HandlerMapping;
import java.util.Map;

@Component
public class SecurityTenantInterceptor implements HandlerInterceptor {

    private final TenantService tenantService;

    public SecurityTenantInterceptor(TenantService tenantService) {
        this.tenantService = tenantService;
    }

    /**
     * This interceptor handles tenant context setting for incoming requests. 
     * It checks for the presence of a tenantSlug path variable,
     * retrieves the corresponding tenant, and sets it in the TenantContext for the duration of the request. 
     * This allows downstream services and components to access tenant-specific 
     * information without having to repeatedly extract the tenantSlug from the request.
     */
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        Map<String, String> pathVariables = (Map<String, String>) request.getAttribute(
                HandlerMapping.URI_TEMPLATE_VARIABLES_ATTRIBUTE);

        if (pathVariables != null && pathVariables.containsKey("tenantSlug")) {
            String tenantSlug = pathVariables.get("tenantSlug");
            if (!AppConstants.SYSTEM_TENANT_SLUG.equals(tenantSlug)) {
                TenantContext.setTenant(this.tenantService.get(tenantSlug));
            }
        }

        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) throws Exception {
        TenantContext.clear();
    }
}