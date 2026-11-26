package org.commonground.forma.model.settings;

import java.util.Collection;
import java.util.Set;
import java.util.UUID;

import org.commonground.forma.database.dao.settings.UserEntity;
import org.commonground.forma.model.constants.UserStatus;
import org.jspecify.annotations.Nullable;
import org.springframework.security.core.GrantedAuthority;

public class UserDetailsExtended extends org.springframework.security.core.userdetails.User implements UserAuthenticated {

    private final UUID tenantId;
    private String email;
    private String name;
    private Set<Group> groups;
    private Set<String> permissions;
    private UserStatus status;

    public UserDetailsExtended(
        String username,
        @Nullable String password,
        Collection<? extends GrantedAuthority> authorities,
        UserEntity userEntity,
        Set<Group> groups,
        Set<String> permissions) {

        super(username, password, authorities);
        this.tenantId = userEntity.getTenantId();
        this.email = userEntity.getEmail();
        this.name = userEntity.getName();
        this.groups = groups;
        this.permissions = permissions;
        this.status = userEntity.getStatus();
    }

    @Override
    public UUID getTenantId() {
        return tenantId;
    }

    @Override
    public String getUsername() {
        return this.email;
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

    public UserStatus getStatus() {
        return status;
    }
}
