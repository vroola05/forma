package org.commonground.forma.mapper;

import java.util.List;
import java.util.UUID;

import org.commonground.forma.database.dao.settings.UserEntity;
import org.commonground.forma.model.settings.Tenant;
import org.commonground.forma.model.settings.User;
import org.commonground.forma.model.settings.UserRegisterRequest;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public UserEntity toNewEntity(UserRegisterRequest dto) {
        if (dto == null) return null;

        UserEntity entity = new UserEntity();
        entity.setName(dto.getName());
        entity.setUsername(dto.getUsername());
        entity.setEmail(dto.getEmail());

        return entity;
    }

    public UserEntity toNewEntity(User dto) {
        if (dto == null) return null;

        UserEntity entity = new UserEntity();
        entity.setId(UUID.randomUUID());
        entity.setName(dto.getName());
        entity.setUsername(dto.getUsername());
        entity.setEmail(dto.getEmail());
        entity.setStatus(dto.getStatus());
        return entity;
    }

    public void updateEntityFromDto(User dto, UserEntity entity) {
        if (dto == null || entity == null) return;

        entity.setName(dto.getName());
        entity.setUsername(dto.getUsername());
        entity.setEmail(dto.getEmail());
        entity.setStatus(dto.getStatus());
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
        dto.setStatus(entity.getStatus());

        return dto;
    }

    public List<User> toResponseDtoList(List<UserEntity> entities) {
        if (entities == null) {
            return null;
        }

        return entities.stream()
                .map(this::toResponseDto)
                .toList();
    }

}