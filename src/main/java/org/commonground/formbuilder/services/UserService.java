package org.commonground.formbuilder.services;

import java.util.UUID;

import org.commonground.formbuilder.model.settings.User;
import org.commonground.formbuilder.model.settings.UserRegisterRequest;

public interface UserService {
    
    public User getByUsername(UUID tenantId, String username);
    public User get(UUID tenantId, UUID id);
    public User createUser(UUID tenantId, UserRegisterRequest userRegisterRequest);
    public User updateUser(UUID tenantId, User user);
}
