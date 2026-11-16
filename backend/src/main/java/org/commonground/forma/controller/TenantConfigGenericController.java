package org.commonground.forma.controller;

import org.commonground.forma.config.tenant.PreAuthorizeTenant;
import org.commonground.forma.config.tenant.TenantContext;
import org.commonground.forma.model.form.FormConfigSuccessPage;
import org.commonground.forma.model.settings.Tenant;
import org.commonground.forma.services.config.FormConfigSuccessPageService;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/{tenantSlug}/api/config/generic/success-page")
public class TenantConfigGenericController {
    private final FormConfigSuccessPageService formConfigSuccessPageService;

    public TenantConfigGenericController(
            FormConfigSuccessPageService formConfigSuccessPageService) {
        
        this.formConfigSuccessPageService = formConfigSuccessPageService;
        
    }


    @PreAuthorize("hasAuthority(@Permissions.FORM_READ)")
    @PreAuthorizeTenant
    @GetMapping
    public FormConfigSuccessPage  getGenericSuccessPage() {
        return formConfigSuccessPageService.getByTenantId(TenantContext.getTenant().getId());
    }

    @PreAuthorize("hasAuthority(@Permissions.FORM_READ)")
    @PreAuthorizeTenant
    @PostMapping
    public FormConfigSuccessPage postGenericSuccessPage(@RequestBody FormConfigSuccessPage formConfigSuccessPage) {
        Tenant tenant = TenantContext.getTenant();
        if (tenant == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "{tenant.error.not_found}");
        }

        formConfigSuccessPageService.saveByTenant(formConfigSuccessPage);
        return formConfigSuccessPage;
    }
}
