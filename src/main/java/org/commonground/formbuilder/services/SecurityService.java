package org.commonground.formbuilder.services;

import java.util.Optional;
import java.util.UUID;

import org.commonground.formbuilder.model.UserDetailsExtended;
import org.commonground.formbuilder.model.settings.UserRole;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class SecurityService {
    public UUID getUserTenantId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication != null && authentication.getPrincipal() instanceof UserDetailsExtended) {
            UserDetailsExtended loggedInUser = (UserDetailsExtended) authentication.getPrincipal();
            return loggedInUser.getTenantId();
        }
        
        // TODO: Catch these exceptions and return a more user-friendly message
        throw new IllegalStateException("{auth.session_expired}");
    }

    private Optional<UserDetailsExtended> getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserDetailsExtended) {
            System.out.println("Retrieving current user: " + ((UserDetailsExtended) auth.getPrincipal()).getUsername());
            return Optional.of((UserDetailsExtended) auth.getPrincipal());
        }
        return Optional.empty();
    }

    public boolean isTenantUser(UUID tenantId) {
        System.out.println("Checking if user belongs to tenant: " + tenantId);
        return getCurrentUser()
                .map(user -> user.getTenantId().equals(tenantId))
                .orElse(false);
    }

    public boolean hasRole(UserRole requiredRole) {
        System.out.println("Checking if user has role: " + requiredRole);
        return getCurrentUser()
                .map(user -> user.getAuthorities().stream()
                        .anyMatch(a -> a.getAuthority().equals(requiredRole.toString())))
                .orElse(false);
    }

    public boolean hasTenantRole(UUID tenantId, UserRole requiredRole) {
        System.out.println("Checking if user has role " + requiredRole + " for tenant: " + tenantId);
        return getCurrentUser()
                .map(user -> user.getTenantId().equals(tenantId) && 
                             user.getAuthorities().stream()
                                 .anyMatch(a -> a.getAuthority().equals(requiredRole.toString())))
                .orElse(false);
    }

    

    public void validateAccessToTenant(UUID tenantId) {
        System.out.println("Validating access to tenant: " + tenantId);
        if (!isTenantUser(tenantId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "{auth.tenant_access_denied}");
        }
    }
}
