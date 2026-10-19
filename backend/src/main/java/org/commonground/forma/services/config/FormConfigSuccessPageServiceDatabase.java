package org.commonground.forma.services.config;

import java.util.Optional;
import java.util.UUID;

import org.commonground.forma.config.tenant.TenantContext;
import org.commonground.forma.database.dao.definition.FormConfigSuccessPageEntity;
import org.commonground.forma.database.dao.definition.FormDefinitionEntity;
import org.commonground.forma.database.repository.FormConfigSuccessPageRepository;
import org.commonground.forma.mapper.SuccessPageMapper;
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
    private final SuccessPageMapper successPageMapper;
    public FormConfigSuccessPageServiceDatabase(
            FormConfigSuccessPageRepository formConfigSuccessPageRepository,
            SuccessPageMapper successPageMapper,
            TiptapService tiptapService) {

        this.formConfigSuccessPageRepository = formConfigSuccessPageRepository;
        this.tiptapService = tiptapService;
        this.successPageMapper = successPageMapper;
    }

    @Override
    public FormConfigSuccessPage getByFormId(UUID id) {
        return successPageMapper.toResponseDto(this.formConfigSuccessPageRepository.findByFormId(id)
                .orElse(new FormConfigSuccessPageEntity()));
    }

    @Override
    public FormConfigSuccessPageEntity getEntityByTenantId(UUID id) {
        return this.formConfigSuccessPageRepository.findByTenantIdAndIsGlobalDefaultIsTrue(id)
                .orElse(new FormConfigSuccessPageEntity());
    }
   
	@Override
	public FormConfigSuccessPage getByTenantId(UUID id) {
        return successPageMapper.toResponseDto(getEntityByTenantId(id));
	}

    @Override
    public FormConfigSuccessPage get(FormDefinitionEntity formDefinitionEntity) {
        FormConfigSuccessPage formConfigSuccessPage = this.getByFormId(formDefinitionEntity.getId());

        if (formConfigSuccessPage == null || formConfigSuccessPage.getId() == null) {
            formConfigSuccessPage = this.getByTenantId(formDefinitionEntity.getTenantId());
        }

        return formConfigSuccessPage;
    }
    

    @Override
    @Transactional
    public FormConfigSuccessPage saveByTenant(FormConfigSuccessPage formConfigSuccessPage) {
        // When the successpage is linked to a tenant (global)
        FormConfigSuccessPageEntity formConfigSuccessPageEntity;

        Optional<FormConfigSuccessPageEntity> successPageEntityOptional = this.formConfigSuccessPageRepository
                .findByTenantIdAndIsGlobalDefaultIsTrue(TenantContext.getTenant().getId());

        if (successPageEntityOptional.isEmpty()) {
            formConfigSuccessPageEntity = successPageMapper.toNewEntity(formConfigSuccessPage, TenantContext.getTenant().getId(), true);
        } else {
            formConfigSuccessPageEntity = successPageEntityOptional.get();
            successPageMapper.updateEntityFromDto(formConfigSuccessPageEntity, formConfigSuccessPage);
        }
        
        return successPageMapper.toResponseDto(this.formConfigSuccessPageRepository.save(formConfigSuccessPageEntity));
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
