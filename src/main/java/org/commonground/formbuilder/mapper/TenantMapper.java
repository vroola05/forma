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
        entity.setEmail(dto.getEmail());
        
        return entity;
    }

    public void updateEntityFromDto(Tenant dto, TenantEntity entity) {
        if (dto == null || entity == null) return;

        entity.setName(dto.getName());
        entity.setStatus(dto.getStatus());
        entity.setHomePage(dto.getHomePage());
        entity.setEmail(dto.getEmail());
    }

    public List<Tenant> toResponseDtoList(List<TenantEntity> tenantEntities) {
        if (tenantEntities == null) {
            return null;
        }

        return tenantEntities.stream()
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
        dto.setEmail(tenantEntity.getEmail());
        dto.setHomePage(tenantEntity.getHomePage());
        dto.setStatus(tenantEntity.getStatus());

        return dto;
    }

}