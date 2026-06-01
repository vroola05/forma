package org.commonground.formbuilder.mapper;

import java.util.UUID;

import org.commonground.formbuilder.database.dao.settings.GroupEntity;
import org.commonground.formbuilder.model.settings.Group;
import org.commonground.formbuilder.model.settings.GroupRegisterRequest;
import org.springframework.stereotype.Component;

@Component
public class GroupMapper {

    public GroupEntity toNewEntity(GroupRegisterRequest dto) {
        if (dto == null) return null;

        GroupEntity entity = new GroupEntity();
        entity.setId(UUID.randomUUID());
        entity.setName(dto.getName());
        return entity;
    }

    public GroupEntity toNewEntity(Group dto) {
        if (dto == null) return null;

        GroupEntity entity = new GroupEntity();
        entity.setId(dto.getId());
        entity.setName(dto.getName());
        return entity;
    }

    public Group toResponseDto(GroupEntity entity) {
        if (entity == null) {
            return null;
        }

        Group dto = new Group();
        dto.setId(entity.getId());
        dto.setName(entity.getName());

        return dto;
    }

    public GroupRegisterRequest toRegisterRequest(GroupEntity entity) {
        if (entity == null) {
            return null;
        }

        GroupRegisterRequest dto = new GroupRegisterRequest();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setPermissions(entity.getPermissions().stream().map(p -> p.getId()).collect(java.util.stream.Collectors.toSet()));
        return dto;
    }

}