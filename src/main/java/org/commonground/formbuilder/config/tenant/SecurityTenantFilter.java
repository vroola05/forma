package org.commonground.formbuilder.config.tenant;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.commonground.formbuilder.config.SecurityConstants;
import org.commonground.formbuilder.services.TenantService;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.servlet.HandlerMapping;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class SecurityTenantFilter extends OncePerRequestFilter {

    private final TenantService tenantService;
    private final AntPathMatcher pathMatcher = new AntPathMatcher();

    private final List<String> excludedPatterns;
    
    public SecurityTenantFilter(TenantService tenantService) {
        this.tenantService = tenantService;
        this.excludedPatterns = new ArrayList<>(SecurityConstants.PUBLIC_MATCHERS);
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        
        // Controleer of het huidige pad overeenkomt met een van onze uitgesloten patronen
        return this.excludedPatterns.stream()
                .anyMatch(pattern -> pathMatcher.match(pattern, path));
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        Map<String, String> pathVariables = (Map<String, String>) request.getAttribute(
                HandlerMapping.URI_TEMPLATE_VARIABLES_ATTRIBUTE);

        if (pathVariables != null && pathVariables.containsKey("tenantSlug")) {
            String tenantSlug = pathVariables.get("tenantSlug");
            if (!"system".equals(tenantSlug)) {
                TenantContext.setTenant(this.tenantService.get(tenantSlug));
            }
        }

        try {
            filterChain.doFilter(request, response);
        } finally {
            TenantContext.clear();
        }
    }
}
