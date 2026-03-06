package org.commonground.formbuilder.database.repository;

import java.util.List;
import java.util.UUID;

import org.commonground.formbuilder.database.dao.definition.FormFieldDefinitionEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FormFieldDefinitionRepository extends JpaRepository<FormFieldDefinitionEntity, UUID> {
    List<FormFieldDefinitionEntity> findAllByTabIdOrderBySortOrderAsc(UUID tabId);
    List<FormFieldDefinitionEntity> findAllByParentIdOrderBySortOrderAsc(UUID parentFieldId);
}
