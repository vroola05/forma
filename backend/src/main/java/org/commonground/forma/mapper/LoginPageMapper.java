package org.commonground.forma.mapper;

import org.commonground.forma.database.dao.definition.FormDefinitionEntity;
import org.commonground.forma.model.form.FormConfigLoginPage;
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

        return dto;
    }

}