package org.commonground.formbuilder.controller;

import org.commonground.formbuilder.config.tenant.TenantContext;
import org.commonground.formbuilder.model.settings.Tenant;
import org.commonground.formbuilder.services.TenantService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping()
public class TenantController {
    private TenantService tenantService;

    public TenantController(
        TenantService tenantService
    ) {
        this.tenantService = tenantService;
    }


    @GetMapping("/{tenantSlug}/api/tenant")
    public Tenant getTenant(@PathVariable() String tenantSlug) {
        Tenant tenant = TenantContext.getTenant();
        if (tenant == null) {
            tenant = new Tenant();
        }
        return tenant;
    }

    @PostMapping("/api/tenant")
    public String postForm(@RequestBody Tenant tenant) {
        this.tenantService.save(tenant);
        return "Het opslaan is gelukt!";
    }
}
