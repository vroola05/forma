package org.commonground.forma.services.form;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import org.commonground.forma.database.dao.definition.FormDefinitionEntity;
import org.commonground.forma.database.dao.definition.FormFieldDefinitionEntity;
import org.commonground.forma.database.dao.definition.FormTabDefinitionEntity;
import org.commonground.forma.database.dao.definition.FormTabInstanceDefinitionEntity;
import org.commonground.forma.database.repository.FormTabDefinitionEntityRepository;
import org.commonground.forma.database.repository.FormTabInstanceDefinitionRepository;
import org.commonground.forma.mapper.FieldMapper;
import org.commonground.forma.mapper.TabPageMapper;
import org.commonground.forma.model.form.fields.Field;
import org.commonground.forma.model.form.fields.TabPage;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@Transactional(readOnly = true)
public class TabPageServiceDatabase implements TabPageService {
    private final TabPageMapper tabPageMapper;
    private final FieldMapper fieldMapper;
    private final FieldService fieldService;
    private final FormTabDefinitionEntityRepository formTabDefinitionEntityRepository;
    private final FormTabInstanceDefinitionRepository formTabInstanceDefinitionRepository;

    public TabPageServiceDatabase(
            TabPageMapper tabPageMapper,
            FieldMapper fieldMapper,
            FieldService fieldService,
            FormTabDefinitionEntityRepository formTabDefinitionEntityRepository,
            FormTabInstanceDefinitionRepository formTabInstanceDefinitionRepository) {
        this.tabPageMapper = tabPageMapper;
        this.fieldMapper = fieldMapper;
        this.fieldService = fieldService;
        this.formTabDefinitionEntityRepository = formTabDefinitionEntityRepository;
        this.formTabInstanceDefinitionRepository = formTabInstanceDefinitionRepository;
    }

    public FormTabDefinitionEntity getFormTabDefinitionById(UUID id) {
        return this.formTabDefinitionEntityRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "{form.tab.error.not_found}"));
    }

    @Override
    public List<Field> get(UUID formId) {
        List<Field> tabPages = new ArrayList<>();
        List<FormTabInstanceDefinitionEntity> formTabInstanceDefinitionEntities = this.formTabInstanceDefinitionRepository
                .findAllByFormIdOrderBySortOrderAsc(formId);
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
        FormTabDefinitionEntity formTabDefinitionEntity;
        boolean isNewTab = (tabPage.getId() == null);

        if (isNewTab) {
            formTabDefinitionEntity = this.tabPageMapper.toNewEntity(tabPage);
            formTabDefinitionEntity.setTenantId(formDefinitionEntity.getTenantId());

        } else {
            formTabDefinitionEntity = getFormTabDefinitionById(tabPage.getId());
            this.tabPageMapper.updateEntityFromDto(formTabDefinitionEntity, tabPage);
            formTabDefinitionEntity.setTenantId(formDefinitionEntity.getTenantId());
        }

        removeFields(formTabDefinitionEntity, tabPage.getFields());
        addFields(formTabDefinitionEntity, tabPage.getFields(), null);

        FormTabDefinitionEntity formTabDefinitionEntityNew = this.formTabDefinitionEntityRepository
                .save(formTabDefinitionEntity);

        if (isNewTab) {
            FormTabInstanceDefinitionEntity formTabInstanceDefinitionEntity = new FormTabInstanceDefinitionEntity();
            formTabInstanceDefinitionEntity.setSortOrder(index);
            formTabInstanceDefinitionEntity.setForm(formDefinitionEntity);
            formTabInstanceDefinitionEntity.setTab(formTabDefinitionEntityNew);
            this.formTabInstanceDefinitionRepository.save(formTabInstanceDefinitionEntity);
        }
    }

    public void removeFields(FormTabDefinitionEntity formTabDefinitionEntity, List<Field> fields) {
        Set<UUID> incomingIds = new HashSet<>();
        flattenFieldIds(fields, incomingIds);

        formTabDefinitionEntity.getFields().removeIf(
                existingField -> {
                    System.out.println("Mooi: " + existingField.getId() != null && !incomingIds.contains(existingField.getId()));
                    return existingField.getId() != null && !incomingIds.contains(existingField.getId());
        });
    }

    public void addFields(FormTabDefinitionEntity formTabDefinitionEntity, List<Field> fields, Field parentDto) {
        for (int index = 0; index < fields.size(); index++) {
            Field field = fields.get(index);

            Optional<FormFieldDefinitionEntity> formFieldDefinitionEntityOptional = formTabDefinitionEntity.getFields().stream()
                    .filter(f -> f.getId() != null && f.getId().equals(field.getId()))
                    .findFirst();

            FormFieldDefinitionEntity formFieldDefinitionEntity;

            if (formFieldDefinitionEntityOptional.isPresent()) {
                formFieldDefinitionEntity = formFieldDefinitionEntityOptional.get();

                fieldMapper.updateEntityFromDto(formFieldDefinitionEntity, field, index);

                moveField(formFieldDefinitionEntity, parentDto);

            } else {
                formFieldDefinitionEntity = fieldMapper.toNewEntity(field, index);

                formFieldDefinitionEntity.setTab(formTabDefinitionEntity);
                formTabDefinitionEntity.getFields().add(formFieldDefinitionEntity);
            }

            addParent(formTabDefinitionEntity, formFieldDefinitionEntity, parentDto);

            if (field.getFields() != null && !field.getFields().isEmpty()) {
                field.setId(formFieldDefinitionEntity.getId());
                addFields(formTabDefinitionEntity, field.getFields(), field);
            }
        }
    }

    private void moveField(FormFieldDefinitionEntity formFieldDefinitionEntity, Field parentDto) {
        FormFieldDefinitionEntity currentParent = formFieldDefinitionEntity.getParent();
        // Do nothing
        if (currentParent == null) {
            return;
        }
        // Nothing changed
        if (parentDto != null && parentDto.getId().equals(currentParent.getId())) {
            return;
        }

        // The database has a parent, and the parentDto is either null or changed
        if (parentDto == null) {
            // The field has been moved from a group to a tab and has no parent.
            formFieldDefinitionEntity.setParent(null);
        } else {
            // 
        }
        

    }

    private void addParent(FormTabDefinitionEntity formTabDefinitionEntity, FormFieldDefinitionEntity formFieldDefinitionEntity, Field parentDto) {
        if (parentDto == null)
            return;

        // Find the parent entity object
        Optional<FormFieldDefinitionEntity> formFieldDefinitionEntityParentOptional = formTabDefinitionEntity.getFields().stream()
            .filter(f -> {
                return f.getId() != null && f.getId().equals(parentDto.getId());
            })
            .findFirst();

        if (formFieldDefinitionEntityParentOptional.isEmpty()) {
            return;
        }

        FormFieldDefinitionEntity formFieldDefinitionEntityParent = formFieldDefinitionEntityParentOptional.get();

        boolean childAlreadyExists = formFieldDefinitionEntityParent.getChildren().stream().anyMatch(f -> {
            return f.getId().equals(formFieldDefinitionEntity.getId());
        });

        if (!childAlreadyExists) {
            formFieldDefinitionEntityParent.getChildren().add(formFieldDefinitionEntity);
        }

        formFieldDefinitionEntity.setParent(formFieldDefinitionEntityParent);
    }

    private void flattenFieldIds(List<Field> fields, Set<UUID> targetSet) {
        if (fields == null)
            return;
        for (Field field : fields) {
            if (field.getId() != null) {
                targetSet.add(field.getId());
            }
            flattenFieldIds(field.getFields(), targetSet);
        }
    }
}
