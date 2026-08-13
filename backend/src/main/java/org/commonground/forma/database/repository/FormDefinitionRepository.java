package org.commonground.forma.database.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.commonground.forma.database.dao.definition.FormDefinitionEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FormDefinitionRepository extends JpaRepository<FormDefinitionEntity, UUID> {
    Optional<FormDefinitionEntity> findByName(String name);
    List<FormDefinitionEntity> findByTenantId(UUID tenantId);
    Optional<FormDefinitionEntity> findByNameAndTenantId(String name, UUID tenantId);

    boolean existsByNameAndTenantIdAndIdNot(String name, UUID tenantId, UUID id);

    boolean existsByNameAndTenantId(String name, UUID tenantId);
}
