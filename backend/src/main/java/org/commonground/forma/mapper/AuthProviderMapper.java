package org.commonground.forma.mapper;


import java.util.List;
import java.util.UUID;

import org.commonground.forma.database.dao.settings.TenantAuthProviderEntity;
import org.commonground.forma.model.form.idp.FormAuthProvider;
import org.commonground.forma.model.form.idp.TenantAuthProvider;
import org.springframework.stereotype.Component;

@Component
public class AuthProviderMapper {
    public TenantAuthProviderEntity toNewEntity(TenantAuthProvider dto) {
        if (dto == null) return null;

        TenantAuthProviderEntity entity = new TenantAuthProviderEntity();
        entity.setId(UUID.randomUUID());

        entity.setProviderType(dto.getProviderType());
        entity.setDisplayName(dto.getDisplayName());
        entity.setInformationText(dto.getInformationText());
        entity.setLinkText(dto.getLinkText());
        entity.setClientId(dto.getClientId());
        entity.setClientSecret(dto.getClientSecret());
        entity.setIssuerUri(dto.getIssuerUri());
        entity.setScopes(dto.getScopes());
        entity.setAcrValues(dto.getAcrValues());
        entity.setActive(dto.isActive());

        return entity;
    }

    public void updateEntityFromDto(TenantAuthProvider dto, TenantAuthProviderEntity entity) {
        if (dto == null || entity == null) return;

        entity.setProviderType(dto.getProviderType());
        entity.setDisplayName(dto.getDisplayName());
        entity.setInformationText(dto.getInformationText());
        entity.setLinkText(dto.getLinkText());
        entity.setClientId(dto.getClientId());
        if (dto.getClientSecret() != null && !dto.getClientSecret().isEmpty()) {
            entity.setClientSecret(dto.getClientSecret());
        }
        entity.setIssuerUri(dto.getIssuerUri());
        entity.setScopes(dto.getScopes());
        entity.setAcrValues(dto.getAcrValues());
        entity.setActive(dto.isActive());

    }

    public TenantAuthProvider toResponseDto(TenantAuthProviderEntity entity) {
        TenantAuthProvider dto = new TenantAuthProvider();

        dto.setId(entity.getId());
        dto.setProviderType(entity.getProviderType());
        dto.setDisplayName(entity.getDisplayName());
        dto.setInformationText(entity.getInformationText());
        dto.setLinkText(entity.getLinkText());
        dto.setClientId(entity.getClientId());
        dto.setIssuerUri(entity.getIssuerUri());
        dto.setScopes(entity.getScopes());
        dto.setAcrValues(entity.getAcrValues());
        dto.setActive(entity.isActive());

        return dto;
    }

    public FormAuthProvider toResponseDtoForm(TenantAuthProviderEntity entity) {
        FormAuthProvider dto = new FormAuthProvider();
        dto.setId(entity.getId());
        dto.setProviderType(entity.getProviderType());
        dto.setDisplayName(entity.getDisplayName());
        dto.setInformationText(entity.getInformationText());
        dto.setLinkText(entity.getLinkText());

        return dto;
    }

    public List<FormAuthProvider> toResponseDtoForms(List<TenantAuthProviderEntity> entities) {
        return entities.stream().map(entity -> toResponseDtoForm(entity)).toList();
    }
}
