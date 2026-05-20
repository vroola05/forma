package org.commonground.formbuilder.services;

import java.util.Optional;
import java.util.UUID;

import org.commonground.formbuilder.model.UserDetailsExtended;
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

    private Optional<UserDetailsExtended> getHuidigeGebruiker() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserDetailsExtended) {
            return Optional.of((UserDetailsExtended) auth.getPrincipal());
        }
        return Optional.empty();
    }

    public boolean heeftToegangTotTenant(UUID gevraagdeTenantId) {
        return getHuidigeGebruiker()
                .map(user -> user.getTenantId().equals(gevraagdeTenantId))
                .orElse(false);
    }

    public boolean heeftRolInTenant(UUID gevraagdeTenantId, String vereisteRol) {
        return getHuidigeGebruiker()
                .map(user -> user.getTenantId().equals(gevraagdeTenantId) && 
                             user.getAuthorities().stream()
                                 .anyMatch(a -> a.getAuthority().equals(vereisteRol)))
                .orElse(false);
    }

    public void valideerToegangTotTenant(UUID gevraagdeTenantId) {
        if (!heeftToegangTotTenant(gevraagdeTenantId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "{auth.tenant_access_denied}");
        }
    }
}
