package org.commonground.forma.controller;

import org.commonground.forma.FormBuilderValidator;
import org.commonground.forma.config.tenant.PreAuthorizeTenant;
import org.commonground.forma.config.tenant.TenantContext;
import org.commonground.forma.model.form.FormWrapper;
import org.commonground.forma.model.settings.Tenant;
import org.commonground.forma.services.form.FormService;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/{tenantSlug}/api/form/settings")
public class GenericFormSettingsController {
    private final FormService formService;

    GenericFormSettingsController(FormService formService) {

        this.formService = formService;
    }

    @PreAuthorize("hasAuthority(@Permissions.FORM_CREATE)")
    @PreAuthorizeTenant
    @PostMapping("/success-page")
    public FormWrapper postBuilderForm(@RequestBody FormWrapper formWrapper) {
        Tenant tenant = TenantContext.getTenant();
        if (tenant == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "{tenant.error.not_found}");
        }

        FormBuilderValidator.validate(formWrapper);
        try {
            return formService.save(tenant.getId(), formWrapper);
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Fout bij opslaan: " + e.getMessage());
        }
    }
}
