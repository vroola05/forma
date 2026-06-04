package org.commonground.formbuilder.mapper;

import java.util.UUID;

import org.commonground.formbuilder.database.dao.definition.FormTabDefinitionEntity;
import org.commonground.formbuilder.model.form.constants.FieldType;
import org.commonground.formbuilder.model.form.fields.TabPage;
import org.springframework.stereotype.Component;

@Component
public class TabPageMapper {

    public FormTabDefinitionEntity toNewEntity(TabPage dto) {
        if (dto == null) return null;

        FormTabDefinitionEntity entity = new FormTabDefinitionEntity();
        entity.setId(UUID.randomUUID());
        entity.setName(dto.getName());
        entity.setLabel(dto.getLabel());
        entity.setClasses(dto.getClasses());
        entity.setSharedTab(dto.isSharedTab());
        entity.setMetadata(dto.getMetadata());
        entity.setCondition(dto.getCondition());
        entity.setShow(dto.isShow());

        return entity;
    }

    public void updateEntityFromDto(FormTabDefinitionEntity entity, TabPage dto) {
        entity.setName(dto.getName());
        entity.setLabel(dto.getLabel());
        entity.setClasses(dto.getClasses());
        entity.setSharedTab(dto.isSharedTab());
        entity.setMetadata(dto.getMetadata());
        entity.setCondition(dto.getCondition());
        entity.setShow(dto.isShow());
    }

    public TabPage toResponseDto(FormTabDefinitionEntity entity) {
        if (entity == null) {
            return null;
        }

        TabPage dto = new TabPage();
        dto.setType(FieldType.TAB);
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setLabel(entity.getLabel());
        dto.setClasses(entity.getClasses());
        dto.setSharedTab(entity.isSharedTab());
        dto.setMetadata(entity.getMetadata());
        dto.setCondition(entity.getCondition());
        dto.setShow(entity.isShow());


        return dto;
    }
}
