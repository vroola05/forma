package org.commonground.formbuilder.services.formConfig;

import java.util.UUID;

import org.commonground.formbuilder.database.dao.definition.FormConfigSuccessPageEntity;
import org.commonground.formbuilder.database.dao.definition.FormDefinitionEntity;
import org.commonground.formbuilder.database.repository.FormConfigSuccessPageRepository;
import org.commonground.formbuilder.model.form.FormConfigSuccessPage;
import org.commonground.formbuilder.model.form.FormWrapper;
import org.commonground.formbuilder.model.form.fields.Form;
import org.commonground.formbuilder.services.editor.TiptapService;
import org.commonground.formbuilder.services.submission.FormSubmissionService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class FormConfigSuccessPageServiceDatabase implements FormConfigSuccessPageService {
    private final FormConfigSuccessPageRepository formConfigSuccessPageRepository;
    private final TiptapService tiptapService;

    public FormConfigSuccessPageServiceDatabase(
            FormConfigSuccessPageRepository formConfigSuccessPageRepository,
            FormSubmissionService formSubmissionService,
            TiptapService tiptapService) {

        this.formConfigSuccessPageRepository = formConfigSuccessPageRepository;
        this.tiptapService = tiptapService;
    }

    @Override
    public FormConfigSuccessPage get(UUID id) {
        return convertFormConfigSuccessPageEntity(this.formConfigSuccessPageRepository.findById(id).orElse(new FormConfigSuccessPageEntity()));
    }

    private FormConfigSuccessPage convertFormConfigSuccessPageEntity(FormConfigSuccessPageEntity formConfigSuccessPageEntity) {
        FormConfigSuccessPage formConfigSuccessPage = new FormConfigSuccessPage();
        
        formConfigSuccessPage.setName(formConfigSuccessPageEntity.getTemplateName());
        formConfigSuccessPage.setTitle(formConfigSuccessPageEntity.getTemplateTitle());
        formConfigSuccessPage.setTemplate(formConfigSuccessPageEntity.getTemplate());
        formConfigSuccessPage.setShowSummary(formConfigSuccessPageEntity.isShowSummary());

        return formConfigSuccessPage;
    }
    
    private FormConfigSuccessPageEntity getFormConfigSuccessPageById(UUID id) {
        return this.formConfigSuccessPageRepository.findById(id).orElse(new FormConfigSuccessPageEntity());
    }

    @Override
    public String save(FormDefinitionEntity formDefinitionEntity, FormConfigSuccessPage formConfigSuccessPage) {
        FormConfigSuccessPageEntity formConfigSuccessPageEntity = getFormConfigSuccessPageById(formDefinitionEntity.getId());


        formConfigSuccessPageEntity.setForm(formDefinitionEntity);
        formConfigSuccessPageEntity.setTemplateName(formConfigSuccessPage.getName());
        formConfigSuccessPageEntity.setTemplateTitle(formConfigSuccessPage.getTitle());
        formConfigSuccessPageEntity.setTemplate(formConfigSuccessPage.getTemplate());
        
        formConfigSuccessPageEntity.setShowSummary(formConfigSuccessPage.getShowSummary() == null ? false : formConfigSuccessPage.getShowSummary());
        this.formConfigSuccessPageRepository.save(formConfigSuccessPageEntity);
        return null;
    }

    @Override
    public String transform(FormWrapper formWrapper, Form form) {

        if (formWrapper.getFormConfig() == null 
                || formWrapper.getFormConfig().getFormConfigSuccessPage() == null
                || formWrapper.getFormConfig().getFormConfigSuccessPage().getTemplate() == null) {
                    throw new ResponseStatusException(HttpStatus.NOT_FOUND, "{form.config.successpage.template.error.not_found}");
        }

        return this.tiptapService.convert(formWrapper.getFormConfig().getFormConfigSuccessPage().getTemplate(), form);
    }

}
