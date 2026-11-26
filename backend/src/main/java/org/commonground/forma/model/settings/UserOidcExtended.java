package org.commonground.forma.model.settings;

import java.util.Collection;
import java.util.Set;
import java.util.UUID;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.core.oidc.user.DefaultOidcUser;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;

import lombok.Getter;

@Getter
public class UserOidcExtended extends DefaultOidcUser implements UserAuthenticated {

    private final UUID tenantId;
    private final String username;
    private final String email;
    private final String name;
    private final Set<Group> groups;
    private final Set<String> permissions;

    public UserOidcExtended(
            OidcUser delegate,
            Collection<? extends GrantedAuthority> authorities,
            UUID tenantId,
            String username,
            String email,
            String name,
            Set<Group> groups,
            Set<String> permissions) {
        super(authorities, delegate.getIdToken(), delegate.getUserInfo());
        this.tenantId = tenantId;
        this.username = username;
        this.email = email;
        this.name = name;
        this.groups = Set.copyOf(groups);
        this.permissions = Set.copyOf(permissions);
    }

    @Override
    public UUID getTenantId() {
        return tenantId;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public String getEmail() {
        return email;
    }

    @Override
    public String getName() {
        return name;
    }


    @Override
    public Set<Group> getGroups() {
        return groups;
    }

    @Override
    public Set<String> getPermissions() {
        return permissions;
    }
}
