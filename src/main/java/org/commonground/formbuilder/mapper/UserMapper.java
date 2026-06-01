package org.commonground.formbuilder.mapper;

import java.util.UUID;

import org.commonground.formbuilder.database.dao.settings.TenantUserEntity;
import org.commonground.formbuilder.model.settings.User;
import org.commonground.formbuilder.model.settings.UserRegisterRequest;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public TenantUserEntity toNewEntity(UserRegisterRequest dto) {
        if (dto == null) return null;

        TenantUserEntity entity = new TenantUserEntity();
        entity.setName(dto.getName());
        entity.setUsername(dto.getUsername());
        entity.setEmail(dto.getEmail());

        return entity;
    }

    public TenantUserEntity toNewEntity(User dto) {
        if (dto == null) return null;

        TenantUserEntity entity = new TenantUserEntity();
        entity.setId(UUID.randomUUID());
        entity.setName(dto.getName());
        entity.setUsername(dto.getUsername());
        entity.setEmail(dto.getEmail());
        entity.setStatus(dto.getStatus());
        return entity;
    }

    public void updateEntityFromDto(User dto, TenantUserEntity entity) {
        if (dto == null || entity == null) return;

        entity.setName(dto.getName());
        entity.setUsername(dto.getUsername());
        entity.setEmail(dto.getEmail());
        entity.setStatus(dto.getStatus());
    }

    public User toResponseDto(TenantUserEntity entity) {
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

}