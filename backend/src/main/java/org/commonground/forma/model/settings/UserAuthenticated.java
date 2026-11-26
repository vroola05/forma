package org.commonground.forma.model.settings;

import java.util.Set;
import java.util.UUID;

public interface UserAuthenticated {
    UUID getTenantId();
    String getUsername();
    String getEmail();
    String getName();
    Set<Group> getGroups();
    Set<String> getPermissions();
}
