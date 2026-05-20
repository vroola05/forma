package org.commonground.formbuilder.services;

import java.util.UUID;

import org.commonground.formbuilder.model.settings.User;

public interface UserService {
    
    public User getByUsername(UUID tenantId, String username);
    public User get(UUID tenantId, UUID id);
    public User save(UUID tenantId, User user);
}
