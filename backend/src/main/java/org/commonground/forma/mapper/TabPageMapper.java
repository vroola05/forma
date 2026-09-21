package org.commonground.forma.mapper;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.commonground.forma.database.dao.definition.FormTabDefinitionEntity;
import org.commonground.forma.database.dao.translation.TabTranslationEntity;
import org.commonground.forma.model.form.Translation;
import org.commonground.forma.model.form.constants.FieldType;
import org.commonground.forma.model.form.fields.TabPage;
import org.springframework.stereotype.Component;

@Component
public class TabPageMapper {

    public FormTabDefinitionEntity toNewEntity(TabPage dto) {
        if (dto == null) return null;

        FormTabDefinitionEntity entity = new FormTabDefinitionEntity();
        entity.setId(UUID.randomUUID());
        entity.setName(dto.getName());
        entity.setClasses(dto.getClasses());
        entity.setSharedTab(dto.isSharedTab());
        entity.setMetadata(dto.getMetadata());
        entity.setCondition(dto.getCondition() == null || dto.getCondition().isEmpty() ? null : dto.getCondition());
        entity.setShow(dto.isShow());

        translationDtoToEntity(entity, dto.getLabels());

        return entity;
    }

    public void updateEntityFromDto(FormTabDefinitionEntity entity, TabPage dto) {
        entity.setName(dto.getName());
        entity.setClasses(dto.getClasses());
        entity.setSharedTab(dto.isSharedTab());
        entity.setMetadata(dto.getMetadata());
        entity.setCondition(dto.getCondition() == null || dto.getCondition().isEmpty() ? null : dto.getCondition());
        entity.setShow(dto.isShow());

        translationDtoToEntity(entity, dto.getLabels());
    }

    public void translationDtoToEntity(FormTabDefinitionEntity entity, List<Translation> translation) {
        Set<String> dtoLocales = translation.stream()
                .map(Translation::getLocale)
                .collect(Collectors.toSet());

        entity.getLabels().removeIf(existing -> !dtoLocales.contains(existing.getLocale()));

        for (Translation dtoLabel : translation) {

            Optional<TabTranslationEntity> existingOpt = entity.getLabels().stream()
                    .filter(e -> e.getLocale().equals(dtoLabel.getLocale()))
                    .findFirst();

            if (existingOpt.isPresent()) {
                existingOpt.get().setLabel(dtoLabel.getText());
            } else {
                TabTranslationEntity newTranslation = new TabTranslationEntity();
                newTranslation.setTab(entity);
                newTranslation.setLocale(dtoLabel.getLocale());
                newTranslation.setLabel(dtoLabel.getText());
                entity.getLabels().add(newTranslation);
            }
        }
    }

    public TabPage toResponseDto(FormTabDefinitionEntity entity) {
        if (entity == null) {
            return null;
        }

        TabPage dto = new TabPage();
        dto.setType(FieldType.TAB);
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setClasses(entity.getClasses());
        dto.setSharedTab(entity.isSharedTab());
        dto.setMetadata(entity.getMetadata());
        dto.setCondition(entity.getCondition());
        dto.setShow(entity.isShow());

        translationEntityToDto(dto, entity);

        return dto;
    }

    public void translationEntityToDto(TabPage dto, FormTabDefinitionEntity entity) {
        List<TabTranslationEntity> translationEntities = entity.getLabels();
        for (TabTranslationEntity translationEntity : translationEntities) {
            Translation translation = new Translation();
            translation.setLocale(translationEntity.getLocale());
            translation.setText(translationEntity.getLabel());
            dto.getLabels().add(translation);
        }
    }
}
