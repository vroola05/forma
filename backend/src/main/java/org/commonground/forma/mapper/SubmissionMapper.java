package org.commonground.forma.mapper;

import java.util.UUID;

import org.commonground.forma.database.dao.submission.FormSubmissionEntity;
import org.commonground.forma.model.form.fields.Form;
import org.commonground.forma.model.submission.Submission;
import org.springframework.stereotype.Component;

@Component
public class SubmissionMapper {
    public FormSubmissionEntity toNewEntity(Form dto, UUID tenantId, UUID formDefinitionId, String formName, Long formVersion) {
        if (dto == null) return null;

        FormSubmissionEntity entity = new FormSubmissionEntity();

        entity.setId(UUID.randomUUID());
        entity.setTenantId(tenantId);
        entity.setFormDefinitionId(formDefinitionId);
        entity.setFormName(formName);
        entity.setFormVersion(formVersion);
        entity.setData(dto);

        
        return entity;
    }

    public Submission toResponseDto(FormSubmissionEntity entity) {
        if (entity == null) {
            return null;
        }

        Submission dto = new Submission();
        dto.setId(entity.getId());
        dto.setFormDefinitionId(entity.getFormDefinitionId());
        dto.setFormName(entity.getFormName());
        dto.setFormVersion(entity.getFormVersion());
        dto.setForm(entity.getData());

        return dto;
    }
}
