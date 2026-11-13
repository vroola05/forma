package org.commonground.forma.mapper;

import java.util.UUID;

import org.commonground.forma.database.dao.definition.FormConfigSuccessPageEntity;
import org.commonground.forma.model.form.FormConfigSuccessPage;
import org.springframework.stereotype.Component;

@Component
public class SuccessPageMapper {

    public FormConfigSuccessPageEntity toNewEntity(FormConfigSuccessPage dto, UUID tenantId, boolean isGlobal) {
        if (dto == null) return null;

        FormConfigSuccessPageEntity entity = new FormConfigSuccessPageEntity();
        entity.setId(UUID.randomUUID());
        entity.setGlobalDefault(isGlobal);
        entity.setTenantId(tenantId);

        entity.setTemplateName(dto.getName());
        entity.setTemplateTitle(dto.getTitle());
        entity.setTemplate(dto.getTemplate());
        entity.setShowSummary(dto.getShowSummary() != null && dto.getShowSummary());
        return entity;
    }

    public void updateEntityFromDto(FormConfigSuccessPageEntity entity, FormConfigSuccessPage dto) {
        entity.setTemplateName(dto.getName());
        entity.setTemplateTitle(dto.getTitle());
        entity.setTemplate(dto.getTemplate());
        entity.setShowSummary(dto.getShowSummary() != null && dto.getShowSummary());
    }

    public FormConfigSuccessPage toResponseDto(FormConfigSuccessPageEntity entity) {
        if (entity == null) {
            return null;
        }

        FormConfigSuccessPage dto = new FormConfigSuccessPage();
        dto.setId(entity.getId());
        dto.setName(entity.getTemplateName());
        dto.setTitle(entity.getTemplateTitle());
        dto.setTemplate(entity.getTemplate());
        dto.setShowSummary(entity.isShowSummary());
        dto.setCustomSuccessPage(entity.getId() != null);

        return dto;
    }

}