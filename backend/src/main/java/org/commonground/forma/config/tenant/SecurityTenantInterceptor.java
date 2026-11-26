package org.commonground.forma.config.tenant;

import org.commonground.forma.services.SecurityService;
import org.commonground.forma.services.TenantService;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class SecurityTenantInterceptor implements HandlerInterceptor {
    private final SecurityService securityService;

    public SecurityTenantInterceptor(
            TenantService tenantService,
            SecurityService securityService) {
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
 

        if (handler instanceof HandlerMethod) {
            HandlerMethod handlerMethod = (HandlerMethod) handler;

            // Check if the method or its declaring class is annotated with @PreAuthorizeTenant
            if (handlerMethod.hasMethodAnnotation(PreAuthorizeTenant.class) || 
                handlerMethod.getBeanType().isAnnotationPresent(PreAuthorizeTenant.class)) {
                // Validate that the tenant in the context is valid and accessible
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