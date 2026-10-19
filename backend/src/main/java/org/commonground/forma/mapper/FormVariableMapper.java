package org.commonground.forma.mapper;

import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.commonground.forma.database.dao.definition.FormVariableEntity;
import org.commonground.forma.database.dao.definition.FormVariableValueEntity;
import org.commonground.forma.model.form.Variable;
import org.commonground.forma.model.form.VariableValue;
import org.springframework.stereotype.Component;

@Component
public class FormVariableMapper {
    
    public FormVariableEntity toNewEntity(Variable dto, int index) {
        FormVariableEntity entity = new FormVariableEntity();
        entity.setId(UUID.randomUUID());

        

        return entity;
    }

    public void updateEntityFromDto(FormVariableEntity entity, Variable dto, int index) {
        
    }

    public Variable toResponseDto(FormVariableEntity entity) {
        Variable dto = new Variable();
        dto.setId(entity.getId());
        dto.setName(entity.getVariableName());
        dto.setTags(getTags(entity));

        dto.setValues(getValues(entity));
        return dto;
    }

    public List<VariableValue> getValues(FormVariableEntity entity) {
        if (entity.getValues() == null) {
            return List.of();
        }

        Set<FormVariableValueEntity> formVariableValueEntities = entity.getValues();
        return formVariableValueEntities.stream().map(variableValueEntity -> {
            VariableValue variableValue = new VariableValue();
            variableValue.setId(variableValueEntity.getId());
            variableValue.setValue(variableValueEntity.getVariableValue());
            variableValue.setConditions(variableValueEntity.getVariableCondition());

            return variableValue;
        }).collect(Collectors.toList());
    }

    public List<String> getTags(FormVariableEntity entity) {
        if (entity.getTags() == null) {
            return List.of();
        }
        
        return entity.getTags()
                .stream()
                .map(tag -> tag.getId().getTagName())
                .collect(Collectors.toList());
    }

    public List<Variable> toResponseDtoList(List<FormVariableEntity> entities) {
        return entities.stream().map(this::toResponseDto).collect(Collectors.toList());
    }

    
}
