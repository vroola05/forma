package org.commonground.forma.processor;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import org.commonground.forma.database.dao.definition.FormFieldDefinitionEntity;
import org.commonground.forma.database.dao.definition.FormTabDefinitionEntity;
import org.commonground.forma.mapper.FieldMapper;
import org.commonground.forma.model.form.fields.Field;
import org.springframework.stereotype.Component;

@Component
public class FormFieldConfigurationProcessor {
    
    private final FieldMapper fieldMapper;

    public FormFieldConfigurationProcessor(
    
            FieldMapper fieldMapper) {
        this.fieldMapper = fieldMapper;
    }

    /**
     * Update all the fields in the tabEntity with the list of incoming fields
     * 
     * @param tabEntity
     * @param incomingFields
     */
    public void syncFieldsForTab(FormTabDefinitionEntity tabEntity, List<Field> incomingFields) {
        
        // Remove fields that are deleted from the dto object
        Set<UUID> incomingIds = new HashSet<>();
        flattenFieldIds(incomingFields, incomingIds);
        tabEntity.removeFieldsExcept(incomingIds);

        // Create/update fields that are added to the dto object
        addFields(tabEntity, incomingFields, null); 
    }

    /**
     * Recursive method loops through all the fields and its children.
     * 
     * @param formTabDefinitionEntity
     * @param fields
     * @param parentDto
     */
    private void addFields(FormTabDefinitionEntity formTabDefinitionEntity, List<Field> fields, Field parentDto) {
        for (int index = 0; index < fields.size(); index++) {
            Field field = fields.get(index);

            Optional<FormFieldDefinitionEntity> formFieldDefinitionEntityOptional = formTabDefinitionEntity.getFields()
                    .stream()
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

    private void addParent(FormTabDefinitionEntity formTabDefinitionEntity,
            FormFieldDefinitionEntity formFieldDefinitionEntity, Field parentDto) {
        if (parentDto == null)
            return;

        // Find the parent entity object
        Optional<FormFieldDefinitionEntity> formFieldDefinitionEntityParentOptional = formTabDefinitionEntity
                .getFields().stream()
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

    /**
     * Flattens the list of fields and adds their IDs to the target set.
     * This method is recursive and will traverse nested fields.
     * 
     * @param fields
     * @param targetSet
     */
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
