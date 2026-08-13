package org.commonground.forma.database.repository;

import java.util.UUID;

import org.commonground.forma.database.dao.definition.FormTabDefinitionEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FormTabDefinitionEntityRepository extends JpaRepository<FormTabDefinitionEntity, UUID> {

}
