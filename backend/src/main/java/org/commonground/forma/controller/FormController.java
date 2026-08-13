package org.commonground.forma.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.commonground.forma.FormValidator;
import org.commonground.forma.config.tenant.TenantContext;
import org.commonground.forma.database.dao.definition.FormConfigSuccessPageEntity;
import org.commonground.forma.database.dao.definition.FormDefinitionEntity;
import org.commonground.forma.database.dao.submission.FormSubmissionEntity;
import org.commonground.forma.exceptions.FieldValidationException;
import org.commonground.forma.exceptions.FormFieldError;
import org.commonground.forma.exceptions.FormValidationException;
import org.commonground.forma.model.constants.FormStatus;
import org.commonground.forma.model.form.FormConfigSuccessPage;
import org.commonground.forma.model.form.FormWrapper;
import org.commonground.forma.model.form.fields.Form;
import org.commonground.forma.model.settings.Tenant;
import org.commonground.forma.model.submission.FormSubmissionResponse;
import org.commonground.forma.services.FileService;
import org.commonground.forma.services.SecurityService;
import org.commonground.forma.services.StorageService;
import org.commonground.forma.services.form.FormService;
import org.commonground.forma.services.form.FormServiceDatabase;
import org.commonground.forma.services.formConfig.FormConfigSuccessPageService;
import org.commonground.forma.services.formConfig.FormConfigSuccessPageServiceDatabase;
import org.commonground.forma.services.submission.FormSubmissionService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import jakarta.validation.constraints.NotBlank;

@RestController
@RequestMapping("/{tenantSlug}/api/forms")
public class FormController {
    
    private final FormService formService;
    private final FormConfigSuccessPageService formConfigSuccessPageService;
    private final FormSubmissionService formSubmissionService;
    private final StorageService storageService;
    private final FileService fileService;
    private final SecurityService securityService;

    public FormController(
        FormServiceDatabase formService,
        FormConfigSuccessPageServiceDatabase formConfigSuccessPageService,
        FormSubmissionService formSubmissionService,
        StorageService storageService,
        FileService fileService,
        SecurityService securityService
    ) {
        this.formService = formService;
        this.formConfigSuccessPageService = formConfigSuccessPageService;
        this.formSubmissionService = formSubmissionService;
        this.storageService = storageService;
        this.fileService = fileService;
        this.securityService = securityService;
    }

    @GetMapping("/{formName}")
    public FormWrapper getForm(@PathVariable String formName) {
        FormWrapper formWrapper = this.formService.get(formName);
        Form form = formWrapper.getForm();
        FormStatus formStatus = form.getStatus();
        if (FormStatus.PUBLISHED.equals(formStatus)) {
            return this.formService.get(formName);
        } else if (FormStatus.DRAFT.equals(formStatus)) {
            if (this.securityService.getCurrentUser().isPresent()) {
                return this.formService.get(formName);
            }
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "{form.definition.error.unauthorized}");
        }
        throw new ResponseStatusException(HttpStatus.NOT_FOUND, "{form.definition.error.not_found}");
    }

    @PostMapping(value = "/success-page")
    public FormConfigSuccessPage getFormSuccessPage(@RequestBody FormSubmissionResponse formSubmission) {

        FormSubmissionEntity formSubmissionEntity = this.formSubmissionService.getFormSubmissionEntity(formSubmission.getSubmissionId());
        FormDefinitionEntity formDefinitionEntity = formSubmissionEntity.getFormDefinition();
        FormConfigSuccessPageEntity formConfigSuccessPageEntity = formDefinitionEntity.getFormConfigSuccessPageEntity();

        FormConfigSuccessPage formConfigSuccessPage = new FormConfigSuccessPage();
        if (formConfigSuccessPageEntity != null) {
            formConfigSuccessPage.setShowSummary(formConfigSuccessPageEntity.isShowSummary());
            formConfigSuccessPage.setName(formConfigSuccessPageEntity.getTemplateName());
            formConfigSuccessPage.setTitle(formConfigSuccessPageEntity.getTemplateTitle());
            // formConfigSuccessPage.setContent(
            //     this.formConfigSuccessPageService.transform(
            //         this.formService.transform(formDefinitionEntity), formSubmissionEntity.getData()));
        }

        return formConfigSuccessPage;
    }

    @PostMapping()
    public FormSubmissionResponse submitForm(@RequestBody Form form) {
        Tenant tenant = TenantContext.getTenant();
        if (tenant == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "{tenant.error.not_found}");
        }
        FormWrapper formWrapperDefinition = this.formService.get(form.getName());
        FormValidator.validate(form, formWrapperDefinition.getForm());


        UUID submissionId = this.formSubmissionService.save(tenant.getId(), form);
        FormSubmissionResponse formSubmission = new FormSubmissionResponse();
        formSubmission.setSubmissionId(submissionId);
        return formSubmission;
    }

    
    @PostMapping("/{formName}/upload")
    public Map<String, String> uploadFile(
            @PathVariable("tenantSlug") String tenantSlug,
            @RequestParam("file") MultipartFile file,
            @RequestParam("clientSessionId") UUID clientSessionId,
            @RequestParam("id") UUID uploadFieldId) {

        Map<String, String> result = null;
        try {
            result = this.fileService.storeFileUploadTemp(file, clientSessionId, uploadFieldId);
        } catch (FieldValidationException e) {
            throw new FormValidationException(List.of(new FormFieldError("file", "file", e.getMessage(), e.getArgs())));
        }

        return result;
    }

    @DeleteMapping("/{formName}/delete/{clientSessionId}/{storedFilename}")
    public Map<String, String> deleteFile(
            @PathVariable("tenantSlug") String tenantSlug,
            @NotBlank @PathVariable("clientSessionId") String clientSessionId,
            @NotBlank @PathVariable("storedFilename") String storedFilename
            ) {
        
        Tenant tenant = TenantContext.getTenant();
        if (tenant == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "{tenant.error.not_found}");
        }

        storageService.deleteTempFile("uploads/" + tenant.getId() + "/" + clientSessionId + "/" + storedFilename);

        Map<String, String> result = new HashMap<>();
        result.put("message", "File deleted");
        result.put("storedFilename", storedFilename);
        return result;

    }
}
