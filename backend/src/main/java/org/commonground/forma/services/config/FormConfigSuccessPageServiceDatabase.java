package org.commonground.forma.services.config;

import java.util.Optional;
import java.util.UUID;

import org.commonground.forma.config.tenant.TenantContext;
import org.commonground.forma.database.dao.definition.FormConfigSuccessPageEntity;
import org.commonground.forma.database.dao.definition.FormDefinitionEntity;
import org.commonground.forma.database.repository.FormConfigSuccessPageRepository;
import org.commonground.forma.model.form.FormConfigSuccessPage;
import org.commonground.forma.model.form.FormWrapper;
import org.commonground.forma.model.form.fields.Form;
import org.commonground.forma.services.editor.TiptapService;
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
            
            TiptapService tiptapService) {

        this.formConfigSuccessPageRepository = formConfigSuccessPageRepository;
        this.tiptapService = tiptapService;
    }

    @Override
    public FormConfigSuccessPage getByFormId(UUID id) {
        return convertFormConfigSuccessPageEntity(this.formConfigSuccessPageRepository.findByFormId(id)
                .orElse(new FormConfigSuccessPageEntity()));
    }

    
	@Override
	public FormConfigSuccessPage getByTenantId(UUID id) {
		return convertFormConfigSuccessPageEntity(this.formConfigSuccessPageRepository.findByTenantIdAndIsGlobalDefaultIsTrue(id)
                .orElse(new FormConfigSuccessPageEntity()));
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
        return this.formConfigSuccessPageRepository.findByForm(formDefinitionEntity).orElseGet(() -> {
            FormConfigSuccessPageEntity formConfigSuccessPageEntity = new FormConfigSuccessPageEntity();
            formConfigSuccessPageEntity.setId(UUID.randomUUID());
            return formConfigSuccessPageEntity;
        });
    }

    @Override
    @Transactional
    public FormConfigSuccessPage saveByForm(FormDefinitionEntity formDefinitionEntity, FormConfigSuccessPage formConfigSuccessPage) {
        if (formDefinitionEntity == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "{tenant.error.no_id}");
        }
    
        // When the successpage is linked to a form
        FormConfigSuccessPageEntity formConfigSuccessPageEntity = getFormConfigSuccessPageById(formDefinitionEntity);
        formConfigSuccessPageEntity.setForm(formDefinitionEntity);
        formConfigSuccessPageEntity.setGlobalDefault(false);
        
        formConfigSuccessPageEntity.setTenantId(formDefinitionEntity.getTenantId());

        formConfigSuccessPageEntity.setTemplateName(formConfigSuccessPage.getName());
        formConfigSuccessPageEntity.setTemplateTitle(formConfigSuccessPage.getTitle());
        formConfigSuccessPageEntity.setTemplate(formConfigSuccessPage.getTemplate());
        
        formConfigSuccessPageEntity.setShowSummary(formConfigSuccessPage.getShowSummary() != null && formConfigSuccessPage.getShowSummary());
        
        return convertFormConfigSuccessPageEntity(this.formConfigSuccessPageRepository.save(formConfigSuccessPageEntity));
        
    }

    @Override
    @Transactional
    public FormConfigSuccessPage saveByTenant(FormConfigSuccessPage formConfigSuccessPage) {
        // When the successpage is linked to a tenant (global)
        FormConfigSuccessPageEntity formConfigSuccessPageEntity = this.formConfigSuccessPageRepository.findByTenantIdAndIsGlobalDefaultIsTrue(TenantContext.getTenant().getId()).orElseGet(() -> {
            FormConfigSuccessPageEntity formConfigSuccessPageEntityNew = new FormConfigSuccessPageEntity();
            formConfigSuccessPageEntityNew.setId(UUID.randomUUID());
            return formConfigSuccessPageEntityNew;
        });

        formConfigSuccessPageEntity.setForm(null);
        formConfigSuccessPageEntity.setGlobalDefault(true);
        
        formConfigSuccessPageEntity.setTenantId(TenantContext.getTenant().getId());

        formConfigSuccessPageEntity.setTemplateName(formConfigSuccessPage.getName());
        formConfigSuccessPageEntity.setTemplateTitle(formConfigSuccessPage.getTitle());
        formConfigSuccessPageEntity.setTemplate(formConfigSuccessPage.getTemplate());
        
        formConfigSuccessPageEntity.setShowSummary(formConfigSuccessPage.getShowSummary() != null && formConfigSuccessPage.getShowSummary());

        return convertFormConfigSuccessPageEntity(this.formConfigSuccessPageRepository.save(formConfigSuccessPageEntity));
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

    @Override
    public void delete(FormConfigSuccessPageEntity formConfigSuccessPageEntity) {
        this.formConfigSuccessPageRepository.delete(formConfigSuccessPageEntity);
    }
}
