package org.commonground.formbuilder.controller;

import java.util.List;
import java.util.UUID;

import org.commonground.formbuilder.config.tenant.PreAuthorizeTenant;
import org.commonground.formbuilder.config.tenant.TenantContext;
import org.commonground.formbuilder.database.dao.settings.PermissionEntity;
import org.commonground.formbuilder.database.repository.PermissionsRepository;
import org.commonground.formbuilder.model.settings.Group;
import org.commonground.formbuilder.model.settings.GroupRegisterRequest;
import org.commonground.formbuilder.model.settings.Tenant;
import org.commonground.formbuilder.services.GroupService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/{tenantSlug}/api/groups")
public class GroupController {

    private final GroupService groupService;
    private final PermissionsRepository permissionsRepository;

    public GroupController(GroupService groupService, PermissionsRepository permissionsRepository) {
        this.groupService = groupService;
        this.permissionsRepository = permissionsRepository;
    }

    @PreAuthorizeTenant
    @PreAuthorize("hasAuthority(@Permissions.GROUP_READ)")
    @GetMapping("/list")
    public List<Group> getGroups() {
        Tenant tenant = TenantContext.getTenant();
        return this.groupService.getAll(tenant.getId());
    }

    @PreAuthorizeTenant
    @PreAuthorize("hasAuthority(@Permissions.GROUP_READ)")
    @GetMapping("/{groupId}")
    public GroupRegisterRequest getGroup(@PathVariable UUID groupId) {
        Tenant tenant = TenantContext.getTenant();
        return this.groupService.get(tenant.getId(), groupId);
    }

    @PreAuthorizeTenant
    @PreAuthorize("hasAuthority(@Permissions.GROUP_CREATE)")
    @PostMapping()
    public Group postGroup(@Valid @RequestBody GroupRegisterRequest groupRegisterRequest) {
        Tenant tenant = TenantContext.getTenant();

        return this.groupService.createGroup(tenant.getId(), groupRegisterRequest);
    }

    @PreAuthorizeTenant
    @PreAuthorize("hasAuthority(@Permissions.GROUP_READ)")
    @GetMapping("/permissions/list")
    public List<String> getPermissions() {
        return permissionsRepository.findAll().stream().map(PermissionEntity::getId).toList();
    }
}
