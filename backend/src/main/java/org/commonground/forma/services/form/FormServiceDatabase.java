package org.commonground.forma.services.form;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.commonground.forma.config.AppConstants;
import org.commonground.forma.config.tenant.TenantContext;
import org.commonground.forma.database.dao.definition.FormDefinitionEntity;
import org.commonground.forma.database.dao.translation.FormTranslationEntity;
import org.commonground.forma.database.repository.FormDefinitionRepository;
import org.commonground.forma.mapper.FormMapper;
import org.commonground.forma.mapper.FormWrapperMapper;
import org.commonground.forma.mapper.TabPageMapper;
import org.commonground.forma.model.form.FormList;
import org.commonground.forma.model.form.FormWrapper;
import org.commonground.forma.model.form.Translation;
import org.commonground.forma.model.form.fields.Form;
import org.commonground.forma.model.settings.Tenant;
import org.commonground.forma.processor.FormConfigurationProcessor;
import org.commonground.forma.services.config.FormConfigSuccessPageService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@Transactional(readOnly = true)
public class FormServiceDatabase implements FormService {
    private final FormWrapperMapper formWrapperMapper;
    private final FormMapper formMapper;
    private final FormDefinitionRepository formDefinitionRepository;
    private final FormConfigSuccessPageService formConfigSuccessPageService;
    private final TabPageService tabPageService;
    private final FormConfigurationProcessor formConfigurationProcessor;
    private final TabPageMapper tabPageMapper;
    public FormServiceDatabase(
            FormWrapperMapper formWrapperMapper,
            FormMapper formMapper,
            TabPageService tabPageService,
            FormConfigSuccessPageService formConfigSuccessPageService,
            FormDefinitionRepository formDefinitionRepository,
            TabPageMapper tabPageMapper,
            FormConfigurationProcessor formConfigurationProcessor) {

        this.formWrapperMapper = formWrapperMapper;
        this.formMapper = formMapper;
        this.formDefinitionRepository = formDefinitionRepository;
        this.tabPageService = tabPageService;
        this.formConfigSuccessPageService = formConfigSuccessPageService;
        this.tabPageMapper = tabPageMapper;
        this.formConfigurationProcessor = formConfigurationProcessor;

    }

    public FormDefinitionEntity getFormDefinitionById(UUID id) {
        return this.formDefinitionRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "{form.definition.error.not_found}"));
    }

    @Override
    public List<FormList> list() {
        Tenant tenant = TenantContext.getTenant();
        List<FormList> formLists = new ArrayList<>();
        List<FormDefinitionEntity> formDefinitionEntities = this.formDefinitionRepository.findByTenantId(tenant.getId());

        formDefinitionEntities.forEach(formDefinitionEntity -> {
            FormList formList = new FormList();
            formList.setId(formDefinitionEntity.getId());
            formList.setName(formDefinitionEntity.getName());
            formList.setLabel(AppConstants.getTranslation(getTranslations(formDefinitionEntity.getLabels())));
            formList.setStatus(formDefinitionEntity.getStatus());
            formLists.add(formList);
        });

        return formLists;
    }

    public List<Translation> getTranslations(List<FormTranslationEntity> translationEntities) {
        List<Translation> translations = new ArrayList<>();
        for (FormTranslationEntity translationEntity : translationEntities) {
            Translation translation = new Translation();
            translation.setLocale(translationEntity.getLocale());
            translation.setText(translationEntity.getLabel());
            translations.add(translation);
        }
        return translations;
    }

    @Override
    @Transactional(readOnly = true)
    public FormWrapper get(String formName) {
        FormDefinitionEntity formDefinitionEntity = this.formDefinitionRepository.findByName(formName)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "{form.definition.error.not_found}"));

        return this.formWrapperMapper.toResponseDto(formDefinitionEntity);
    }

    @Override
    @Transactional
    public FormWrapper save(UUID tenantId, FormWrapper formWrapper) {
        Form form = formWrapper.getForm();
        UUID formId = form.getId();

        if (isNameNotUnique(form.getName(), tenantId, formId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "{form.definition.error.not_unique}");
        }

        FormDefinitionEntity formDefinitionEntity = (formId == null) 
            ? this.formMapper.toNewEntity(form, tenantId) 
            : updateExistingEntity(formId, form, tenantId);

        
        this.formConfigurationProcessor.processUpdate(formDefinitionEntity, formWrapper);

        FormDefinitionEntity resultEntity = this.formDefinitionRepository.save(formDefinitionEntity);
        // Return dto
        return null;
    }


    private boolean isNameNotUnique(String name, UUID tenantId, UUID formId) {
        return (formId == null) 
            ? this.formDefinitionRepository.existsByNameAndTenantId(name, tenantId)
            : this.formDefinitionRepository.existsByNameAndTenantIdAndIdNot(name, tenantId, formId);
}

    private FormDefinitionEntity updateExistingEntity(UUID formId, Form form, UUID tenantId) {
        FormDefinitionEntity entity = this.getFormDefinitionById(formId);
        this.formMapper.updateEntityFromDto(entity, form, tenantId);
        return entity;
    }
}
