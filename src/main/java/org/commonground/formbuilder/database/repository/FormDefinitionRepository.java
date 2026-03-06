package org.commonground.formbuilder.database.repository;

import java.util.Optional;
import java.util.UUID;

import org.commonground.formbuilder.database.dao.definition.FormDefinitionEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FormDefinitionRepository extends JpaRepository<FormDefinitionEntity, UUID> {
    Optional<FormDefinitionEntity> findByName(String name);

}
