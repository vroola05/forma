package org.commonground.forma.services.form;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import org.commonground.forma.config.AppConstants;
import org.commonground.forma.config.tenant.TenantContext;
import org.commonground.forma.database.dao.definition.FormConfigSuccessPageEntity;
import org.commonground.forma.database.dao.definition.FormDefinitionEntity;
import org.commonground.forma.database.dao.translation.FormTranslationEntity;
import org.commonground.forma.database.repository.FormDefinitionRepository;
import org.commonground.forma.mapper.FormMapper;
import org.commonground.forma.model.form.FormConfig;
import org.commonground.forma.model.form.FormConfigSuccessPage;
import org.commonground.forma.model.form.FormList;
import org.commonground.forma.model.form.FormWrapper;
import org.commonground.forma.model.form.Translation;
import org.commonground.forma.model.form.fields.Field;
import org.commonground.forma.model.form.fields.Form;
import org.commonground.forma.model.form.fields.TabPage;
import org.commonground.forma.model.settings.Tenant;
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
    private final FormMapper formMapper;
    private final FormDefinitionRepository formDefinitionRepository;
    private final FormConfigSuccessPageService formConfigSuccessPageService;
    private final TabPageService tabPageService;

    public FormServiceDatabase(
            FormMapper formMapper,
            TabPageService tabPageService,
            FormConfigSuccessPageService formConfigSuccessPageService,
            FormDefinitionRepository formDefinitionRepository) {

        this.formMapper = formMapper;
        this.formDefinitionRepository = formDefinitionRepository;
        this.tabPageService = tabPageService;
        this.formConfigSuccessPageService = formConfigSuccessPageService;

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
        formDefinitionEntities.stream().forEach(formDefinitionEntity -> {

            List<FormTranslationEntity> a = formDefinitionEntity.getLabels();
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
    public FormWrapper get(String formName) {
        FormDefinitionEntity formDefinitionEntity = this.formDefinitionRepository.findByName(formName)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "{form.definition.error.not_found}"));

        FormWrapper formWrapper = new FormWrapper();
        
        Form form = formMapper.toResponseDto(formDefinitionEntity);

        form.setFields(tabPageService.get(formDefinitionEntity.getId()));

        formWrapper.setForm(form);

        formWrapper.setFormConfig(new FormConfig());
        formWrapper.getFormConfig()
                .setFormConfigSuccessPage(this.formConfigSuccessPageService.getByFormId(formDefinitionEntity.getId()));

        return formWrapper;
    }

    @Override
    @Transactional
    public FormWrapper save(UUID tenantId, FormWrapper formWrapper) {
        Form form = formWrapper.getForm();

        boolean isNewForm = form.getId() == null;
        boolean isNotUnique;

        if (isNewForm) {
            isNotUnique = this.formDefinitionRepository.existsByNameAndTenantId(form.getName(), tenantId);
        } else {
            isNotUnique = this.formDefinitionRepository.existsByNameAndTenantIdAndIdNot(form.getName(), tenantId, form.getId());
        }

        if (isNotUnique) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "{form.definition.error.not_unique}");
        }

        FormDefinitionEntity formDefinitionEntity;
        if (isNewForm) {
            formDefinitionEntity = this.formMapper.toNewEntity(form, tenantId);
        } else {
            formDefinitionEntity = this.getFormDefinitionById(form.getId());
            this.formMapper.updateEntityFromDto(formDefinitionEntity, form, tenantId);
        }

        Set<UUID> incomingIds = new HashSet<>();
        form.getFields().forEach(f -> {
            if (f.getId() != null) incomingIds.add(f.getId());
        });

        formDefinitionEntity.getTabs().removeIf(existingTabInstance -> !incomingIds.contains(existingTabInstance.getTab().getId()));


        boolean removeSuccessPage = formWrapper.getFormConfig() == null
                || formWrapper.getFormConfig().getFormConfigSuccessPage() == null
                || formWrapper.getFormConfig().getFormConfigSuccessPage().getUseSuccessPage() == null
                || !formWrapper.getFormConfig().getFormConfigSuccessPage().getUseSuccessPage();

        FormConfig formConfig = formWrapper.getFormConfig();
        if (removeSuccessPage) {
            FormConfigSuccessPageEntity formConfigSuccessPageEntity = formDefinitionEntity.getFormConfigSuccessPageEntity();
            if (formConfigSuccessPageEntity != null) {
                formDefinitionEntity.removeFormConfigSuccessPageEntity();
                formConfig.setFormConfigSuccessPage(null);
                this.formConfigSuccessPageService.delete(formConfigSuccessPageEntity);
            }
        }

        FormDefinitionEntity resultEntity = this.formDefinitionRepository.save(formDefinitionEntity);

        int sortOrderTab = 0;
        for (Field field : form.getFields()) {
            TabPage tabPage = (TabPage) field;
            this.tabPageService.save(resultEntity, tabPage, sortOrderTab++);
        }

        if (!removeSuccessPage) {
            this.formConfigSuccessPageService.saveByForm(resultEntity, formConfig.getFormConfigSuccessPage());
        }

        return null;
    }

}
