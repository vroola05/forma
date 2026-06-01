package org.commonground.formbuilder.controller;

import org.commonground.formbuilder.config.tenant.PreAuthorizeTenant;
import org.commonground.formbuilder.model.settings.User;
import org.commonground.formbuilder.services.SecurityService;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/{tenantSlug}/api/users")
public class UserController {

    private final SecurityService securityService;

    public UserController(SecurityService securityService) {
        this.securityService = securityService;
        
    }

    @PreAuthorizeTenant
    @GetMapping("/me")
    public User getAuthenticatedUser(Authentication authentication) {
        System.out.println("Jajajajajajajajaj Authentication: ");
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
}
