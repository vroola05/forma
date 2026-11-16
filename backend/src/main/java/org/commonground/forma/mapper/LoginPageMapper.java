package org.commonground.forma.mapper;

import java.util.Set;

import org.commonground.forma.database.dao.definition.FormDefinitionEntity;
import org.commonground.forma.database.dao.settings.TenantAuthProviderEntity;
import org.commonground.forma.model.form.FormConfigLoginPage;
import org.commonground.forma.model.form.idp.FormAuthProvider;
import org.springframework.stereotype.Component;

@Component
public class LoginPageMapper {

    public FormConfigLoginPage toResponseDto(FormDefinitionEntity entity) {
        if (entity == null) {
            return null;
        }

        FormConfigLoginPage dto = new FormConfigLoginPage();
        dto.setLoginInstructions(entity.getLoginInstructions());
        dto.setPublicAccess(entity.isPublicAccess());
        dto.setAllowFormLogin(entity.isAllowFormLogin());

        Set<FormAuthProvider> formAuthProviders = dto.getFormAuthProvider();
        for (TenantAuthProviderEntity tenantAuthProviderEntity : entity.getAllowedProviders()) {
            FormAuthProvider formAuthProviderDto = new FormAuthProvider();
            formAuthProviderDto.setId(tenantAuthProviderEntity.getId());
            formAuthProviderDto.setProviderType(tenantAuthProviderEntity.getProviderType());
            formAuthProviderDto.setDisplayName(tenantAuthProviderEntity.getDisplayName());
            formAuthProviderDto.setInformationText(tenantAuthProviderEntity.getInformationText());
            formAuthProviderDto.setLinkText(tenantAuthProviderEntity.getLinkText());

            formAuthProviders.add(formAuthProviderDto);
        }


        Set<TenantAuthProviderEntity> allowedProviders = entity.getAllowedProviders();
        for (TenantAuthProviderEntity allowedProvider : allowedProviders) {}
        return dto;
    }

}