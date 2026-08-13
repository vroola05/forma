package org.commonground.forma.mapper;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import org.commonground.forma.database.dao.settings.TenantEntity;
import org.commonground.forma.model.settings.Tenant;
import org.springframework.stereotype.Component;

@Component
public class TenantMapper {

    public TenantEntity toNewEntity(Tenant dto) {
        if (dto == null) return null;

        TenantEntity entity = new TenantEntity();
        entity.setId(UUID.randomUUID());

        entity.setSlug(dto.getSlug());
        entity.setName(dto.getName());
        entity.setStatus(dto.getStatus());
        entity.setHomePage(dto.getHomePage());
        entity.setPrimaryColor(dto.getPrimaryColor());
        entity.setSecondaryColor(dto.getSecondaryColor());
        entity.setEmail(dto.getEmail());
        return entity;
    }

    public void updateEntityFromDto(Tenant dto, TenantEntity entity) {
        if (dto == null || entity == null) return;

        entity.setUpdatedAt(Instant.now());
        entity.setName(dto.getName());
        entity.setStatus(dto.getStatus());
        entity.setHomePage(dto.getHomePage());
        entity.setPrimaryColor(dto.getPrimaryColor());
        entity.setSecondaryColor(dto.getSecondaryColor());
        entity.setEmail(dto.getEmail());
    }

    public List<Tenant> toResponseDtoList(List<TenantEntity> entities) {
        if (entities == null) {
            return null;
        }

        return entities.stream()
                .map(this::toResponseDto)
                .toList();
    }

    public Tenant toResponseDto(TenantEntity entity) {
        if (entity == null) {
            return null;
        }

        Tenant dto = new Tenant();
        dto.setId(entity.getId());
        dto.setSlug(entity.getSlug());
        dto.setName(entity.getName());
        dto.setHasLogo(entity.getLogo() != null && !entity.getLogo().isEmpty());
        dto.setEmail(entity.getEmail());
        dto.setHomePage(entity.getHomePage());
        dto.setStatus(entity.getStatus());
        dto.setPrimaryColor(entity.getPrimaryColor());
        dto.setSecondaryColor(entity.getSecondaryColor());

        return dto;
    }

}