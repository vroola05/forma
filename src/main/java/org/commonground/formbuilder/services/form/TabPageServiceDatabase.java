package org.commonground.formbuilder.services.form;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.commonground.formbuilder.database.dao.definition.FormDefinitionEntity;
import org.commonground.formbuilder.database.dao.definition.FormTabDefinitionEntity;
import org.commonground.formbuilder.database.dao.definition.FormTabInstanceDefinitionEntity;
import org.commonground.formbuilder.database.repository.FormTabDefinitionEntityRepository;
import org.commonground.formbuilder.database.repository.FormTabInstanceDefinitionRepository;
import org.commonground.formbuilder.mapper.TabPageMapper;
import org.commonground.formbuilder.model.form.fields.Field;
import org.commonground.formbuilder.model.form.fields.TabPage;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import jakarta.transaction.Transactional;

@Service
public class TabPageServiceDatabase implements TabPageService {
    private final TabPageMapper tabPageMapper;
    private final FieldService fieldService;
    private final FormTabDefinitionEntityRepository formTabDefinitionEntityRepository;
    private final FormTabInstanceDefinitionRepository formTabInstanceDefinitionRepository;

    public TabPageServiceDatabase(
            TabPageMapper tabPageMapper,
            FieldService fieldService,
            FormTabDefinitionEntityRepository formTabDefinitionEntityRepository,
            FormTabInstanceDefinitionRepository formTabInstanceDefinitionRepository
) {
        this.tabPageMapper = tabPageMapper;
        this.fieldService = fieldService;
        this.formTabDefinitionEntityRepository = formTabDefinitionEntityRepository;
        this.formTabInstanceDefinitionRepository = formTabInstanceDefinitionRepository;
    }

    public FormTabDefinitionEntity getFormTabDefinitionById(UUID id) {
        return this.formTabDefinitionEntityRepository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "{form.tab.error.not_found}"));
    }

    @Override
    public List<TabPage> get(UUID formId) {
        List<TabPage> tabPages = new ArrayList<>();
        List<FormTabInstanceDefinitionEntity> formTabInstanceDefinitionEntities = this.formTabInstanceDefinitionRepository.findAllByFormIdOrderBySortOrderAsc(formId);
        for (FormTabInstanceDefinitionEntity formTabInstanceDefinitionEntity : formTabInstanceDefinitionEntities) {
            FormTabDefinitionEntity formTabDefinitionEntity = formTabInstanceDefinitionEntity.getTab();
            TabPage tabPage = this.tabPageMapper.toResponseDto(formTabDefinitionEntity);

            tabPages.add(tabPage);

            tabPage.setFields(this.fieldService.get(formTabDefinitionEntity.getId()));
        }
        return tabPages;
    }

    @Override
    public TabPage get(UUID formId, UUID id) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'get'");
    }

    @Override
    @Transactional
    public void save(FormDefinitionEntity formDefinitionEntity, TabPage tabPage, int index) {
        FormTabInstanceDefinitionEntity formTabInstanceDefinitionEntity = new FormTabInstanceDefinitionEntity();
        formTabInstanceDefinitionEntity.setSortOrder(index);
        formTabInstanceDefinitionEntity.setForm(formDefinitionEntity);

        FormTabDefinitionEntity formTabDefinitionEntity;
        if (tabPage.getId() == null) {
            formTabDefinitionEntity = this.tabPageMapper.toNewEntity(tabPage);
        } else {
            formTabDefinitionEntity = getFormTabDefinitionById(tabPage.getId());
            this.tabPageMapper.updateEntityFromDto(formTabDefinitionEntity, tabPage);
        }

        this.formTabDefinitionEntityRepository.save(formTabDefinitionEntity);

        formTabInstanceDefinitionEntity.setTab(formTabDefinitionEntity);
        this.formTabInstanceDefinitionRepository.save(formTabInstanceDefinitionEntity);

        int sortOrderGroup = 0;
        for (Field fieldInstance : tabPage.getFields()) {
            this.fieldService.save(formTabDefinitionEntity, fieldInstance, sortOrderGroup++);
        }
    }
    
}
