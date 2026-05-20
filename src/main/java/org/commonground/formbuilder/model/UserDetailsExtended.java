package org.commonground.formbuilder.model;

import java.util.Collection;
import java.util.UUID;

import org.jspecify.annotations.Nullable;
import org.springframework.security.core.GrantedAuthority;

public class UserDetailsExtended extends org.springframework.security.core.userdetails.User {

    private final UUID tenantId;

    public UserDetailsExtended(String username, @Nullable String password,
            Collection<? extends GrantedAuthority> authorities, UUID tenantId) {
        super(username, password, authorities);
        this.tenantId = tenantId;
    }

    public UUID getTenantId() {
        return tenantId;
    }
}
