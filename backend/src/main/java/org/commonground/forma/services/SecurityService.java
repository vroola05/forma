package org.commonground.forma.services;

import java.util.Optional;
import java.util.UUID;

import org.commonground.forma.config.tenant.TenantContext;
import org.commonground.forma.model.settings.UserDetailsExtended;
import org.commonground.forma.model.settings.constants.Permissions;
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

    public Optional<UserDetailsExtended> getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserDetailsExtended) {
            return Optional.of((UserDetailsExtended) auth.getPrincipal());
        }
        return Optional.empty();
    }

    public boolean isTenantUser(UUID tenantId) {
        return getCurrentUser()
                .map(user -> (tenantId != null && user.getTenantId() != null && user.getTenantId().equals(tenantId)) 
                    || (tenantId == null && user.getTenantId() == null && user.getAuthorities().stream()
                        .anyMatch(a -> a.getAuthority().equals(Permissions.TENANT_READ_INTERNAL.toString()))))
                .orElse(false);
    }


    public void validateAccessToTenant() {
        getCurrentUser()
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "{auth.session_expired}"));
        if (!isTenantUser(TenantContext.getTenant().getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "{auth.tenant_access_denied}");
        }
    }
}
