package org.commonground.forma.config.tenant;

import java.io.IOException;
import java.util.List;

import org.commonground.forma.config.AppConstants;
import org.commonground.forma.config.SecurityConfig;
import org.commonground.forma.model.settings.Tenant;
import org.commonground.forma.services.TenantService;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.PathContainer;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.util.pattern.PathPattern;
import org.springframework.web.util.pattern.PathPatternParser;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class TenantContextFilter extends OncePerRequestFilter {

    private final TenantService tenantService;

    private static final List<PathPattern> TENANT_PATTERNS = List.of(
        PathPatternParser.defaultInstance.parse(SecurityConfig.BASE_OAUTH_URI + "/*"),
        PathPatternParser.defaultInstance.parse(SecurityConfig.BASE_OAUTH_CODE_URI + "/*"),
        PathPatternParser.defaultInstance.parse("/{tenantSlug}/**")
    );

    public TenantContextFilter(TenantService tenantService) {
        this.tenantService = tenantService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        try {
            String tenantSlug = extractTenantSlug(request);
            if (tenantSlug != null && !AppConstants.SYSTEM_TENANT_SLUG.equals(tenantSlug)) {
                Tenant tenant = tenantService.get(tenantSlug);
                TenantContext.setTenant(tenant);
            } else {
                TenantContext.setTenant(new Tenant());
            }
            filterChain.doFilter(request, response);
        } catch (ResponseStatusException ex) {
            response.sendError(HttpStatus.NOT_FOUND.value(), ex.getReason());
            return;
        } finally {
            TenantContext.clear();
        }
    }

    private String extractTenantSlug(HttpServletRequest request) {
        PathContainer path = PathContainer.parsePath(request.getServletPath());
        for (PathPattern pattern : TENANT_PATTERNS) {
            PathPattern.PathMatchInfo matchInfo = pattern.matchAndExtract(path);
            if (matchInfo != null && matchInfo.getUriVariables().containsKey("tenantSlug")) {
                return matchInfo.getUriVariables().get("tenantSlug");
            }
        }
        return null;
    }
}
