package org.commonground.formbuilder.controller;

import java.util.List;

import org.commonground.formbuilder.FormBuilderValidator;
import org.commonground.formbuilder.config.tenant.TenantContext;
import org.commonground.formbuilder.model.FormList;
import org.commonground.formbuilder.model.FormWrapper;
import org.commonground.formbuilder.model.settings.Tenant;
import org.commonground.formbuilder.services.form.FormService;
import org.springframework.http.HttpStatus;
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

    @GetMapping()
    public List<FormList> getForms() {
        return formService.list();
    }

    @GetMapping("/{formName}")
    public FormWrapper getForm(@PathVariable String formName) {
        return formService.get(formName);
    }

    @PostMapping()
    public FormWrapper postBuilderForm(@RequestBody FormWrapper formWrapper) {
        System.out.println("Start postBuilderForm");
        Tenant tenant = TenantContext.getTenant();
        if (tenant == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "{tenant.error.not_found}");
        }
        FormBuilderValidator.validate(formWrapper);
        System.out.println("postBuilderForm");
        try {
            return formService.save(tenant.getId(), formWrapper);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Fout bij opslaan: " + e.getMessage());
        }
    }
}
