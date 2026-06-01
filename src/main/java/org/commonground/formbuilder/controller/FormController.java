package org.commonground.formbuilder.controller;

import java.util.UUID;

import org.commonground.formbuilder.FormValidator;
import org.commonground.formbuilder.database.dao.definition.FormConfigSuccessPageEntity;
import org.commonground.formbuilder.database.dao.definition.FormDefinitionEntity;
import org.commonground.formbuilder.database.dao.submission.FormSubmissionEntity;
import org.commonground.formbuilder.model.form.FormConfigSuccessPage;
import org.commonground.formbuilder.model.form.FormWrapper;
import org.commonground.formbuilder.model.form.fields.Form;
import org.commonground.formbuilder.model.submission.FormSubmission;
import org.commonground.formbuilder.services.form.FormService;
import org.commonground.formbuilder.services.form.FormServiceDatabase;
import org.commonground.formbuilder.services.formConfig.FormConfigSuccessPageService;
import org.commonground.formbuilder.services.formConfig.FormConfigSuccessPageServiceDatabase;

import org.commonground.formbuilder.services.submission.FormSubmissionService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/{tenantSlug}/api/forms")
public class FormController {
    
    private FormService formService;
    private FormConfigSuccessPageService formConfigSuccessPageService;
    private FormSubmissionService formSubmissionService;

    public FormController(
        FormServiceDatabase formService,
        FormConfigSuccessPageServiceDatabase formConfigSuccessPageService,
        FormSubmissionService formSubmissionService
    ) {
        this.formService = formService;
        this.formConfigSuccessPageService = formConfigSuccessPageService;
        this.formSubmissionService = formSubmissionService;
    }

    @GetMapping("/{formName}")
    public FormWrapper getForm(@PathVariable String formName) {
        return this.formService.get(formName);
    }

    @PostMapping(value = "/success-page")
    public FormConfigSuccessPage getFormSuccessPage(@RequestBody FormSubmission formSubmission) {

        FormSubmissionEntity formSubmissionEntity = this.formSubmissionService.getFormSubmissionEntity(formSubmission.getSubmissionId());
        FormDefinitionEntity formDefinitionEntity = formSubmissionEntity.getFormDefinition();
        FormConfigSuccessPageEntity formConfigSuccessPageEntity = formDefinitionEntity.getFormConfigSuccessPageEntity();

        FormConfigSuccessPage formConfigSuccessPage = new FormConfigSuccessPage();
        if (formConfigSuccessPageEntity != null) {
            formConfigSuccessPage.setShowSummary(formConfigSuccessPageEntity.isShowSummary());
            formConfigSuccessPage.setName(formConfigSuccessPageEntity.getTemplateName());
            formConfigSuccessPage.setTitle(formConfigSuccessPageEntity.getTemplateTitle());
            formConfigSuccessPage.setContent(
                this.formConfigSuccessPageService.transform(
                    this.formService.transform(formDefinitionEntity), formSubmissionEntity.getData()));
        }

        return formConfigSuccessPage;
    }

    @PostMapping()
    public FormSubmission submitForm(@RequestBody Form form) {
        FormWrapper formWrapperDefinition = this.formService.get(form.getName());
        FormValidator.validate(form, formWrapperDefinition.getForm());


        UUID submissionId = this.formSubmissionService.save(form);
        FormSubmission formSubmission = new FormSubmission();
        formSubmission.setSubmissionId(submissionId);
        return formSubmission;
    }
}
