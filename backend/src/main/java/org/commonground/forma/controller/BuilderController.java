package org.commonground.forma.controller;

import java.util.List;

import org.commonground.forma.FormBuilderValidator;
import org.commonground.forma.config.tenant.PreAuthorizeTenant;
import org.commonground.forma.config.tenant.TenantContext;
import org.commonground.forma.model.form.FormList;
import org.commonground.forma.model.form.FormWrapper;
import org.commonground.forma.model.settings.Tenant;
import org.commonground.forma.services.form.FormService;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/{tenantSlug}/api/form-builder/form")
public class BuilderController {
    private final FormService formService;

    BuilderController(FormService formService) {

        this.formService = formService;
    }

    @PreAuthorize("hasAuthority(@Permissions.FORM_READ)")
    @PreAuthorizeTenant
    @GetMapping()
    public List<FormList> getForms() {
        return formService.list();
    }

    @PreAuthorize("hasAuthority(@Permissions.FORM_READ)")
    @PreAuthorizeTenant
    @GetMapping("/{formName}")
    public FormWrapper getForm(@PathVariable String formName) {
        return formService.get(formName);
    }

    @PreAuthorize("hasAuthority(@Permissions.FORM_CREATE)")
    @PreAuthorizeTenant
    @PostMapping()
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
