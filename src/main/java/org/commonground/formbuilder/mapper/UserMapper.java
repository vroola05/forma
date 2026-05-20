package org.commonground.formbuilder.mapper;

import java.util.UUID;

import org.commonground.formbuilder.database.dao.settings.UserEntity;
import org.commonground.formbuilder.model.settings.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public UserEntity toNewEntity(User dto) {
        if (dto == null) return null;

        UserEntity entity = new UserEntity();
        entity.setId(UUID.randomUUID());
        entity.setName(dto.getName());
        entity.setUsername(dto.getUsername());
        entity.setEmail(dto.getEmail());
        entity.setRole(dto.getRole());
        entity.setActive(dto.isActive());
        return entity;
    }

    public void updateEntityFromDto(User dto, UserEntity entity) {
        if (dto == null || entity == null) return;

        entity.setName(dto.getName());
        entity.setUsername(dto.getUsername());
        entity.setEmail(dto.getEmail());
        entity.setRole(dto.getRole());
        entity.setActive(dto.isActive());
    }

    public User toResponseDto(UserEntity entity) {
        if (entity == null) {
            return null;
        }

        User dto = new User();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setUsername(entity.getUsername());
        dto.setEmail(entity.getEmail());
        dto.setRole(entity.getRole());
        dto.setActive(entity.isActive());

        

        return dto;
    }

}