package org.commonground.formbuilder.model.settings;

import java.util.Collection;
import java.util.Set;
import java.util.UUID;

import org.commonground.formbuilder.database.dao.settings.UserEntity;
import org.commonground.formbuilder.model.constants.UserStatus;
import org.jspecify.annotations.Nullable;
import org.springframework.security.core.GrantedAuthority;

public class UserDetailsExtended extends org.springframework.security.core.userdetails.User {

    private final UUID tenantId;
    private String email;
    private String name;
    private Set<Group> groups;
    private Set<String> permissions;
    private UserStatus status;

    public UserDetailsExtended(String username, @Nullable String password, Collection<? extends GrantedAuthority> authorities,
        UserEntity userEntity, Set<Group> groups, Set<String> permissions) {

        super(username, password, authorities);
        this.tenantId = userEntity.getTenantId();
        this.email = userEntity.getEmail();
        this.name = userEntity.getName();
        this.groups = groups;
        this.permissions = permissions;
        this.status = userEntity.getStatus();
    }

    public UUID getTenantId() {
        return tenantId;
    }

    public String getEmail() {
        return email;
    }

    public String getName() {
        return name;
    }

    public UserStatus getStatus() {
        return status;
    }

    public Set<String> getPermissions() {
        return permissions;
    }

    public Set<Group> getGroups() {
        return groups;
    }
}
