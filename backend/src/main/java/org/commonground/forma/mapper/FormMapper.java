package org.commonground.forma.mapper;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.commonground.forma.database.dao.definition.FormDefinitionEntity;
import org.commonground.forma.database.dao.translation.FormTranslationEntity;
import org.commonground.forma.model.form.Option;
import org.commonground.forma.model.form.Translation;
import org.commonground.forma.model.form.constants.FieldType;
import org.commonground.forma.model.form.fields.CheckboxField;
import org.commonground.forma.model.form.fields.Form;
import org.springframework.stereotype.Component;

@Component
public class FormMapper {

    public FormDefinitionEntity toNewEntity(Form dto, UUID tenantId) {
        if (dto == null)
            return null;

        FormDefinitionEntity entity = new FormDefinitionEntity();
        entity.setId(UUID.randomUUID());
        entity.setTenantId(tenantId);
        entity.setName(dto.getName());
        entity.setClasses(dto.getClasses());
        entity.setStatus(dto.getStatus());
        entity.setMetadata(dto.getMetadata());
        entity.setConfirmation(dto.getConfirmation());
        entity.setCondition(dto.getCondition() == null || dto.getCondition().isEmpty() ? null : dto.getCondition());
        entity.setShow(dto.isShow());

        translationDtoToEntity(entity, dto.getLabels());

        return entity;
    }

    public void updateEntityFromDto(FormDefinitionEntity entity, Form dto, UUID tenantId) {
        entity.setTenantId(tenantId);
        entity.setName(dto.getName());
        entity.setClasses(dto.getClasses());
        entity.setStatus(dto.getStatus());
        entity.setMetadata(dto.getMetadata());
        entity.setConfirmation(dto.getConfirmation());
        entity.setCondition(dto.getCondition() == null || dto.getCondition().isEmpty() ? null : dto.getCondition());
        entity.setShow(dto.isShow());

        translationDtoToEntity(entity, dto.getLabels());
        
    }


    public void translationDtoToEntity(FormDefinitionEntity entity, List<Translation> translation) {
        Set<String> dtoLocales = translation.stream()
                .map(Translation::getLocale)
                .collect(Collectors.toSet());

        entity.getLabels().removeIf(existing -> !dtoLocales.contains(existing.getLocale()));

        for (Translation dtoLabel : translation) {

            Optional<FormTranslationEntity> existingOpt = entity.getLabels().stream()
                    .filter(e -> e.getLocale().equals(dtoLabel.getLocale()))
                    .findFirst();

            if (existingOpt.isPresent()) {
                existingOpt.get().setLabel(dtoLabel.getText());
            } else {
                FormTranslationEntity newTranslation = new FormTranslationEntity();
                newTranslation.setForm(entity);
                newTranslation.setLocale(dtoLabel.getLocale());
                newTranslation.setLabel(dtoLabel.getText());
                entity.getLabels().add(newTranslation);
            }
        }
    }

    public Form toResponseDto(FormDefinitionEntity entity) {
        if (entity == null) {
            return null;
        }

        Form dto = new Form();
        dto.setId(entity.getId());
        dto.setType(FieldType.FORM);
        dto.setName(entity.getName());
        dto.setStatus(entity.getStatus());
        dto.setClasses(entity.getClasses());
        dto.setMetadata(entity.getMetadata());
        dto.setConfirmation(entity.getConfirmation());

        if (entity.getConfirmation() != null) {
            for (int i = 0; i < entity.getConfirmation().size(); i++) {
                CheckboxField check = new CheckboxField();
                check.setType(FieldType.CHECKBOX);
                check.setName("confirmation-" + (i + 1));
                check.setRequired(true);
                check.setOptions(new ArrayList<>());
                check.getOptions().add(new Option(entity.getConfirmation().get(i),
                        entity.getConfirmation().get(i), false));
                dto.getConfirmationCheck().add(check);
            }
        }
        dto.setCondition(entity.getCondition());
        dto.setShow(entity.isShow());

        translationEntityToDto(dto, entity);

        return dto;
    }


    public void translationEntityToDto(Form dto, FormDefinitionEntity entity) {
        List<FormTranslationEntity> translationEntities = entity.getLabels();
        for (FormTranslationEntity translationEntity : translationEntities) {
            Translation translation = new Translation();
            translation.setLocale(translationEntity.getLocale());
            translation.setText(translationEntity.getLabel());
            dto.getLabels().add(translation);
        }
    }
}
