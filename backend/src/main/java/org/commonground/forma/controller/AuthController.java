package org.commonground.forma.controller;

import org.commonground.forma.config.tenant.PreAuthorizeTenant;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping()
public class AuthController {

    @PreAuthorizeTenant
    @GetMapping("/{tenantSlug}/api/authenticated")
    public boolean isAuthenticated(Authentication authentication) {
        return authentication != null && authentication.isAuthenticated()
               && !"anonymousUser".equals(authentication.getPrincipal());
    }
    
    @GetMapping("/{tenantSlug}/api/csrf")
    public CsrfToken csrf(HttpServletRequest request) {
        return (CsrfToken) request.getAttribute("_csrf");
    }
}