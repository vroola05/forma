package org.commonground.formbuilder.mapper;

import java.util.List;
import java.util.UUID;

import org.commonground.formbuilder.database.dao.settings.TenantEntity;
import org.commonground.formbuilder.model.settings.Tenant;
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

    public Tenant toResponseDto(TenantEntity tenantEntity) {
        if (tenantEntity == null) {
            return null;
        }

        Tenant dto = new Tenant();
        dto.setId(tenantEntity.getId());
        dto.setSlug(tenantEntity.getSlug());
        dto.setName(tenantEntity.getName());
        dto.setHasLogo(tenantEntity.getLogo() != null && !tenantEntity.getLogo().isEmpty());
        dto.setEmail(tenantEntity.getEmail());
        dto.setHomePage(tenantEntity.getHomePage());
        dto.setStatus(tenantEntity.getStatus());
        dto.setPrimaryColor(tenantEntity.getPrimaryColor());
        dto.setSecondaryColor(tenantEntity.getSecondaryColor());

        return dto;
    }

}