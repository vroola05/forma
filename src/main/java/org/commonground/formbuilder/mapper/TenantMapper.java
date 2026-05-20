package org.commonground.formbuilder.mapper;

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
        entity.setActive(dto.isActive());
        entity.setLogo(dto.getLogo());
        entity.setHomePage(dto.getHomePage());
        entity.setEmail(dto.getEmail());
        
        return entity;
    }

    public void updateEntityFromDto(Tenant dto, TenantEntity entity) {
        if (dto == null || entity == null) return;

        entity.setSlug(dto.getSlug());
        entity.setName(dto.getName());
        entity.setActive(dto.isActive());
        entity.setLogo(dto.getLogo());
        entity.setHomePage(dto.getHomePage());
        entity.setEmail(dto.getEmail());
    }

    public Tenant toResponseDto(TenantEntity tenantEntity) {
        if (tenantEntity == null) {
            return null;
        }

        Tenant dto = new Tenant();
        dto.setId(tenantEntity.getId());
        dto.setSlug(tenantEntity.getSlug());
        dto.setName(tenantEntity.getName());
        dto.setActive(tenantEntity.isActive());
        dto.setLogo(tenantEntity.getLogo());
        dto.setHomePage(tenantEntity.getHomePage());

        return dto;
    }

}