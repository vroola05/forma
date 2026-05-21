package org.commonground.formbuilder.services;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.commonground.formbuilder.config.AppConstants;
import org.commonground.formbuilder.config.tenant.TenantContext;
import org.commonground.formbuilder.database.dao.settings.UserEntity;
import org.commonground.formbuilder.database.repository.UserRepository;
import org.commonground.formbuilder.model.UserDetailsExtended;
import org.commonground.formbuilder.model.settings.Tenant;
import org.commonground.formbuilder.model.settings.UserRole;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import jakarta.servlet.http.HttpServletRequest;

@Service
public class TenantUserDetailsService implements UserDetailsService {

    private final TenantService tenantService;
    private final UserRepository userRepository;
    private final AntPathMatcher pathMatcher = new AntPathMatcher();

    public TenantUserDetailsService(TenantService tenantService, UserRepository userRepository) {
        this.tenantService = tenantService;
        this.userRepository = userRepository;
    }


    /**
     * This method sets the tenant context based on the tenantSlug extracted from the incoming request's URI.
     * It uses Spring's RequestContextHolder to access the current HTTP request and AntPathMatcher
     * to match the URI against a predefined pattern that includes the tenantSlug. If a tenantSlug is found and is not "system",
     * it retrieves the corresponding tenant from the TenantService and sets it in the TenantContext.
     * 
     * This approach allows the loadUserByUsername method to operate with the correct tenant context,
     * enabling tenant-specific user retrieval logic.
     */
    public void setTenantSlug() {
        
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();

        if (attributes != null) {
            HttpServletRequest request = attributes.getRequest();
            String path = request.getRequestURI();
            
            
            String loginPattern = "/{tenantSlug}/api/login";
            System.out.println("Request URI: " + path + " matches " + loginPattern + ": " + pathMatcher.match(loginPattern, path));
            if (pathMatcher.match(loginPattern, path)) {
                Map<String, String> variabelen = pathMatcher.extractUriTemplateVariables(loginPattern, path);
                String tenantSlug = variabelen.get("tenantSlug");
                System.out.println("Extracted tenantSlug: " + tenantSlug);
                if (tenantSlug != null) {
                    System.out.println("Setting tenant context for slug: " + tenantSlug);
                    TenantContext.setTenant(this.tenantService.get(tenantSlug));
                    System.out.println("Current tenant in context: " + (TenantContext.getTenant() != null ? TenantContext.getTenant().getSlug() : "null"));
                    return;
                }
            }
        }
        throw new UsernameNotFoundException("{tenant.error.not_found}");
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        System.out.println("Loading user by username: " + username);
        setTenantSlug();
        Tenant currentTenant = TenantContext.getTenant();

        System.out.println("Current tenant in loadUserByUsername: " + (currentTenant != null ? currentTenant.getSlug() : "null"));
        UserEntity userEntity;
        if (currentTenant == null) {
            userEntity = userRepository.findByUsernameAndTenantIdIsNull(username)
                    .orElseThrow(() -> new UsernameNotFoundException("{user.error.not_found}"));
System.out.println("User found: " + userEntity.getUsername() + ", Role: " + userEntity.getRole());
            if (!UserRole.ROLE_GLOBAL_ADMIN.equals(userEntity.getRole())) {
                System.out.println("User is not a global admin, throwing exception");
                throw new UsernameNotFoundException("{user.error.not_found}");
            }
        } else {
            UUID tenantId = currentTenant.getId();
            userEntity = userRepository.findByUsernameAndTenantId(username, tenantId)
                    .orElseThrow(() -> new UsernameNotFoundException("{user.error.not_found}"));
        }

        List<SimpleGrantedAuthority> authorities = List.of(new SimpleGrantedAuthority(userEntity.getRole().toString()));

        UserDetailsExtended userDetails = new UserDetailsExtended(
                userEntity.getUsername(),
                userEntity.getPassword(),
                authorities,
                userEntity.getTenantId());

        return userDetails;
    }
}
