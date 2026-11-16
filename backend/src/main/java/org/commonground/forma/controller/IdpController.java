package org.commonground.forma.controller;

import java.util.List;
import java.util.UUID;

import org.commonground.forma.config.tenant.TenantContext;
import org.commonground.forma.model.form.idp.FormAuthProvider;
import org.commonground.forma.model.form.idp.TenantAuthProvider;
import org.commonground.forma.model.settings.Tenant;
import org.commonground.forma.services.IdpService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/{tenantSlug}/api/idp")
public class IdpController {
    private final IdpService idpService;

    public IdpController(IdpService idpService) {
        this.idpService = idpService;

    }

    @PreAuthorize("hasAuthority(@Permissions.LOGIN_MANAGEMENT_READ)")
    @GetMapping("/{id}")
    public TenantAuthProvider get(@PathVariable() UUID id) {
        Tenant tenant = TenantContext.getTenant();
        
        return this.idpService.get(tenant.getId(), id);
    }

    @PreAuthorize("hasAuthority(@Permissions.FORM_CREATE)")
    @GetMapping("/form/list")
    public List<FormAuthProvider> getFormIdps() {
        Tenant tenant = TenantContext.getTenant();
        return this.idpService.getFormIdps(tenant.getId());
    }

    @PreAuthorize("hasAuthority(@Permissions.LOGIN_MANAGEMENT_READ)")
    @GetMapping("/list")
    public List<TenantAuthProvider> getIdps() {
        Tenant tenant = TenantContext.getTenant();
        return this.idpService.getAll(tenant.getId());
    }

    @PreAuthorize("hasAuthority(@Permissions.LOGIN_MANAGEMENT_UPDATE)")
    @PostMapping()
    public TenantAuthProvider postAuthProvider(@PathVariable() String tenantSlug, @Valid @RequestBody TenantAuthProvider tenantAuthProvider) {
        Tenant tenant = TenantContext.getTenant();

        return this.idpService.createAuthProvider(tenant.getId(), tenantAuthProvider);
    }

    @PreAuthorize("hasAuthority(@Permissions.LOGIN_MANAGEMENT_UPDATE)")
    @PutMapping("/{id}")
    public TenantAuthProvider putAuthProvider(@PathVariable() String tenantSlug, @Valid @RequestBody TenantAuthProvider tenantAuthProvider) {
        Tenant tenant = TenantContext.getTenant();
        
        return this.idpService.updateAuthProvider(tenant.getId(), tenantAuthProvider);
    }

}
