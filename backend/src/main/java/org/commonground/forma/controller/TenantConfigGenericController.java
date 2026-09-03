package org.commonground.forma.controller;

import java.util.List;

import org.commonground.forma.FormBuilderValidator;
import org.commonground.forma.config.tenant.PreAuthorizeTenant;
import org.commonground.forma.config.tenant.TenantContext;
import org.commonground.forma.model.form.FormConfigSuccessPage;
import org.commonground.forma.model.form.FormWrapper;
import org.commonground.forma.model.settings.Tenant;
import org.commonground.forma.services.TenantService;
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
@RequestMapping("/{tenantSlug}/api/config/generic")
public class TenantConfigGenericController {
    private final TenantService tenantService;
    private final FormConfigSuccessPageService formConfigSuccessPageService;

    private static final List<String> ALLOWED_LOGO_TYPES = List.of("image/png", "image/svg+xml");

    public TenantConfigGenericController(
            TenantService tenantService,
            FormConfigSuccessPageService formConfigSuccessPageService) {
        this.tenantService = tenantService;
        this.formConfigSuccessPageService = formConfigSuccessPageService;
        
    }


    @PreAuthorize("hasAuthority(@Permissions.FORM_READ)")
    @PreAuthorizeTenant
    @GetMapping("/success-page")
    public FormConfigSuccessPage  getGenericSuccessPage() {
        return formConfigSuccessPageService.getByTenantId(TenantContext.getTenant().getId());
    }

    @PreAuthorize("hasAuthority(@Permissions.FORM_READ)")
    @PreAuthorizeTenant
    @PostMapping("/success-page")
    public FormConfigSuccessPage postGenericSuccessPage(@RequestBody FormConfigSuccessPage formConfigSuccessPage) {
        Tenant tenant = TenantContext.getTenant();
        if (tenant == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "{tenant.error.not_found}");
        }

        formConfigSuccessPageService.saveByTenant(formConfigSuccessPage);
        return formConfigSuccessPage;
    }
}
