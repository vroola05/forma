package org.commonground.forma.services.formConfig;

import java.util.UUID;

import org.commonground.forma.database.dao.definition.FormConfigSuccessPageEntity;
import org.commonground.forma.database.dao.definition.FormDefinitionEntity;
import org.commonground.forma.database.repository.FormConfigSuccessPageRepository;
import org.commonground.forma.model.form.FormConfigSuccessPage;
import org.commonground.forma.model.form.FormWrapper;
import org.commonground.forma.model.form.fields.Form;
import org.commonground.forma.services.editor.TiptapService;
import org.commonground.forma.services.submission.FormSubmissionService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@Transactional(readOnly = true)
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
    
    private FormConfigSuccessPageEntity getFormConfigSuccessPageById(FormDefinitionEntity formDefinitionEntity) {
        return this.formConfigSuccessPageRepository.findByForm(formDefinitionEntity).orElse(new FormConfigSuccessPageEntity());
    }

    @Override
    @Transactional
    public String save(FormDefinitionEntity formDefinitionEntity, FormConfigSuccessPage formConfigSuccessPage) {
        FormConfigSuccessPageEntity formConfigSuccessPageEntity = getFormConfigSuccessPageById(formDefinitionEntity);

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
