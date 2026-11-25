package org.commonground.forma.controller;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import org.commonground.forma.config.tenant.PreAuthorizeTenant;
import org.commonground.forma.config.tenant.TenantContext;
import org.commonground.forma.model.constants.UserStatus;
import org.commonground.forma.model.settings.Group;
import org.commonground.forma.model.settings.Tenant;
import org.commonground.forma.model.settings.User;
import org.commonground.forma.model.settings.UserRegisterRequest;
import org.commonground.forma.services.SecurityService;
import org.commonground.forma.services.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
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

    @GetMapping("/forms/me")
    public ResponseEntity<User> getAuthenticatedFormUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        if (authentication.getPrincipal() instanceof OidcUser oidcUser) {
            String email = oidcUser.getEmail() != null
                    ? oidcUser.getEmail()
                    : oidcUser.getPreferredUsername();

            User dto = new User();
            dto.setName(oidcUser.getFullName());
            dto.setUsername(email);
            dto.setEmail(email);
            dto.setStatus(UserStatus.ACTIVE); // Of jouw standaard actieve status
            dto.setGroups(Set.of()); // Hier koppel je straks de gemapte groepen aan
            dto.setPermissions(Set.of()); // Geen interne admin-rechten

            List<String> externalGroups = oidcUser.getClaimAsStringList("groups");
            if (externalGroups != null && !externalGroups.isEmpty()) {
                Set<Group> groups = new HashSet<>();
                for (String externalGroup : externalGroups) {
                    Group group = new Group();
                    group.setName(externalGroup);
                    groups.add(group);
                }
                dto.setGroups(groups);
            } else {
                dto.setGroups(Set.of());
            }

            return ResponseEntity.ok(dto);
        }

        return this.securityService.getCurrentUser()
                .map(user -> {
                    User dto = new User();
                    dto.setUsername(user.getUsername());
                    dto.setEmail(user.getEmail());
                    dto.setName(user.getName());
                    dto.setStatus(user.getStatus());
                    dto.setPermissions(user.getPermissions());
                    dto.setGroups(user.getGroups());
                    return ResponseEntity.ok(dto);
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED).build());
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
