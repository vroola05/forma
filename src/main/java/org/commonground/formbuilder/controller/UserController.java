package org.commonground.formbuilder.controller;

import java.util.List;
import java.util.UUID;

import org.commonground.formbuilder.config.tenant.PreAuthorizeTenant;
import org.commonground.formbuilder.config.tenant.TenantContext;
import org.commonground.formbuilder.model.settings.Tenant;
import org.commonground.formbuilder.model.settings.User;
import org.commonground.formbuilder.model.settings.UserRegisterRequest;
import org.commonground.formbuilder.services.SecurityService;
import org.commonground.formbuilder.services.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/{tenantSlug}/api/users")
public class UserController {

    private final UserService userService;
    private final SecurityService securityService;

    public UserController(UserService userService, SecurityService securityService) {
        this.userService = userService;
        this.securityService = securityService;
    }

    @PreAuthorizeTenant
    @GetMapping("/me")
    public User getAuthenticatedUser(Authentication authentication) {
        return this.securityService.getCurrentUser().map(user -> {
            System.out.println("Authenticated user: " + user.getUsername());
            User dto = new User();
            dto.setUsername(user.getUsername());
            dto.setEmail(user.getEmail());
            dto.setName(user.getName());
            dto.setStatus(user.getStatus());
            dto.setPermissions(user.getPermissions());
            dto.setGroups(user.getGroups());

            return dto;
        }).orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "{auth.session_expired}"));
    }

    @PreAuthorizeTenant
    @PreAuthorize("hasAuthority(@Permissions.USER_READ)")
    @GetMapping("/{userId}")
    public User getuser(@PathVariable UUID userId) {
        Tenant tenant = TenantContext.getTenant();
        return this.userService.get(tenant.getId(), userId);
    }

    @PreAuthorizeTenant
    @PreAuthorize("hasAuthority(@Permissions.USER_READ)")
    @GetMapping("/list")
    public List<User> getUsers() {
        Tenant tenant = TenantContext.getTenant();
        return this.userService.getAll(tenant.getId());
    }

    @PreAuthorizeTenant
    @PreAuthorize("hasAuthority(@Permissions.USER_CREATE)")
    @PostMapping()
    public User postUser(@Valid @RequestBody UserRegisterRequest userRegisterRequest) {

        Tenant tenant = TenantContext.getTenant();

        return userService.createUser(tenant.getId(), userRegisterRequest);
    }

    @PreAuthorizeTenant
    @PreAuthorize("hasAuthority(@Permissions.USER_UPDATE)")
    @PutMapping("/{userId}")
    public User updateUser(@PathVariable UUID userId, @Valid @RequestBody UserRegisterRequest userRegisterRequest) {
        if (userId == null || !userId.equals(userRegisterRequest.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "{user.error.no_id}");
        }

        Tenant tenant = TenantContext.getTenant();

        return userService.updateUser(tenant.getId(), userRegisterRequest);
    }
}
