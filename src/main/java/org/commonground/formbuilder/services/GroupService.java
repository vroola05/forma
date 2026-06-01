package org.commonground.formbuilder.services;

import java.util.List;
import java.util.UUID;

import org.commonground.formbuilder.model.settings.Group;
import org.commonground.formbuilder.model.settings.GroupRegisterRequest;

public interface GroupService {
    public List<Group> getAll(UUID tenantId);
    public GroupRegisterRequest get(UUID tenantId, UUID groupId);
    Group createGroup(UUID tenantId, GroupRegisterRequest groupRegisterRequest);
    Group createTenantAdminGroup(UUID tenantId);
    void deleteGroup(UUID tenantId, UUID groupId);
}
