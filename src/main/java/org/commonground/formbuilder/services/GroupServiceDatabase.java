package org.commonground.formbuilder.services;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import org.commonground.formbuilder.database.dao.settings.PermissionEntity;
import org.commonground.formbuilder.database.dao.settings.GroupEntity;
import org.commonground.formbuilder.database.repository.PermissionsRepository;
import org.commonground.formbuilder.database.repository.GroupRepository;
import org.commonground.formbuilder.mapper.GroupMapper;
import org.commonground.formbuilder.model.settings.Group;
import org.commonground.formbuilder.model.settings.GroupRegisterRequest;
import org.commonground.formbuilder.model.settings.constants.Permissions;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@Transactional(readOnly = true)
public class GroupServiceDatabase implements GroupService {

    private final GroupMapper groupMapper;
    private final GroupRepository groupRepository;
    private final PermissionsRepository permissionsRepository;

    public GroupServiceDatabase(
            GroupMapper groupMapper, 
            GroupRepository groupRepository,
            PermissionsRepository permissionsRepository) {
        this.groupMapper = groupMapper;
        this.groupRepository = groupRepository;
        this.permissionsRepository = permissionsRepository;
    }

    

    @Override
    public List<Group> getAll(UUID tenantId) {
        return this.groupRepository.findAllByTenantId(tenantId).stream().map(this.groupMapper::toResponseDto).collect(java.util.stream.Collectors.toList());
    }

    @Override
    public GroupRegisterRequest get(UUID tenantId, UUID groupId) {
        GroupEntity groupEntity = this.groupRepository.findByTenantIdAndId(tenantId, groupId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "{group.error.not_found}"));
        return this.groupMapper.toRegisterRequest(groupEntity);
    }

    @Transactional
    public Group createGroup(UUID tenantId, GroupRegisterRequest groupRegisterRequest) {
        if (this.groupRepository.existsByNameAndTenantId(groupRegisterRequest.getName(), tenantId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "{group.error.name_exists}");
        }

        GroupEntity groupEntity = this.groupMapper.toNewEntity(groupRegisterRequest);
        groupEntity.setTenantId(tenantId);

        List<PermissionEntity> permissions = this.permissionsRepository.findAllById(groupRegisterRequest.getPermissions());
        permissions.forEach(permission -> groupEntity.getPermissions().add(permission));

        GroupEntity savedGroupEntity = this.groupRepository.save(groupEntity);
        return groupMapper.toResponseDto(savedGroupEntity);
    }

    @Transactional
    public void deleteGroup(UUID tenantId, UUID groupId) {
        this.groupRepository.deleteById(groupId);
    }

    @Override
    @Transactional
    public Group createTenantAdminGroup(UUID tenantId) {
        GroupRegisterRequest groupRequest = new GroupRegisterRequest();
        groupRequest.setName("Administrators");

        Set<String> adminPermissions = new HashSet<>( List.of(
            Permissions.USER_CREATE,
            Permissions.USER_READ,
            Permissions.USER_UPDATE,
            Permissions.USER_DELETE,
            Permissions.GROUP_CREATE,
            Permissions.GROUP_READ,
            Permissions.GROUP_UPDATE,
            Permissions.GROUP_DELETE,
            Permissions.FORM_CREATE,
            Permissions.FORM_READ,
            Permissions.FORM_UPDATE,
            Permissions.FORM_DELETE,
            Permissions.SUBMISSION_CREATE,
            Permissions.SUBMISSION_READ,
            Permissions.SUBMISSION_UPDATE,
            Permissions.SUBMISSION_DELETE
        ));
        groupRequest.setPermissions(adminPermissions);

        return this.createGroup(tenantId, groupRequest);
    }

}
