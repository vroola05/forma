package org.commonground.formbuilder.config.tenant;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.commonground.formbuilder.config.AppConstants;
import org.commonground.formbuilder.model.settings.Tenant;
import org.commonground.formbuilder.services.SecurityService;
import org.commonground.formbuilder.services.TenantService;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.HandlerMapping;
import java.util.Map;

@Component
public class SecurityTenantInterceptor implements HandlerInterceptor {

    private final TenantService tenantService;
    private final SecurityService securityService;

    public SecurityTenantInterceptor(
            TenantService tenantService,
            SecurityService securityService) {
        this.tenantService = tenantService;
        this.securityService = securityService;
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

                System.out.println("SecurityTenantInterceptor: preHandle called with path variables: " + pathVariables);
        TenantContext.setTenant(new Tenant());
        if (pathVariables != null && pathVariables.containsKey("tenantSlug")) {
            String tenantSlug = pathVariables.get("tenantSlug");
            if (!AppConstants.SYSTEM_TENANT_SLUG.equals(tenantSlug)) {
                TenantContext.setTenant(this.tenantService.get(tenantSlug));
            }
        }
        System.out.println("Tenant set in context: " + TenantContext.getTenant().getSlug());
        if (handler instanceof HandlerMethod) {
            HandlerMethod handlerMethod = (HandlerMethod) handler;
            

            // Check if the method or its declaring class is annotated with @PreAuthorizeTenant
            if (handlerMethod.hasMethodAnnotation(PreAuthorizeTenant.class) || 
                handlerMethod.getBeanType().isAnnotationPresent(PreAuthorizeTenant.class)) {
                // Validate that the tenant in the context is valid and accessible
                System.out.println("aaaaaaaaaaaaaa = Validating tenant access for handler: " + handlerMethod.getMethod().getName());
                securityService.validateAccessToTenant();
            }
        }

        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) throws Exception {
        TenantContext.clear();
    }
}