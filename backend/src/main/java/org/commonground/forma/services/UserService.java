package org.commonground.forma.services;

import java.util.List;
import java.util.UUID;

import org.commonground.forma.model.settings.User;
import org.commonground.forma.model.settings.UserRegisterRequest;

public interface UserService {
    
    public List<User> getAll(UUID tenantId);
    public User getByUsername(UUID tenantId, String username);
    public User get(UUID tenantId, UUID id);
    public User createUser(UUID tenantId, UserRegisterRequest userRegisterRequest);
    public User updateUser(UUID tenantId, UserRegisterRequest userRegisterRequest);
}
