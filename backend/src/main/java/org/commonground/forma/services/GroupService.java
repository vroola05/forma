package org.commonground.forma.services;

import java.util.List;
import java.util.UUID;

import org.commonground.forma.model.settings.Group;
import org.commonground.forma.model.settings.GroupRegisterRequest;

public interface GroupService {
    public List<Group> getAll(UUID tenantId);
    public GroupRegisterRequest get(UUID tenantId, UUID groupId);
    Group createGroup(UUID tenantId, GroupRegisterRequest groupRegisterRequest);
    Group createTenantAdminGroup(UUID tenantId);
    Group updateGroup(UUID tenantId, GroupRegisterRequest groupRegisterRequest);
    void deleteGroup(UUID tenantId, UUID groupId);
}
