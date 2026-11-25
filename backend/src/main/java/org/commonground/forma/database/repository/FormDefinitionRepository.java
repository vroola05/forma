package org.commonground.forma.database.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.commonground.forma.database.dao.definition.FormDefinitionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface FormDefinitionRepository extends JpaRepository<FormDefinitionEntity, UUID> {
    Optional<FormDefinitionEntity> findByName(String name);

    List<FormDefinitionEntity> findByTenantId(UUID tenantId);

    Optional<FormDefinitionEntity> findByNameAndTenantId(String name, UUID tenantId);

    boolean existsByNameAndTenantIdAndIdNot(String name, UUID tenantId, UUID id);

    boolean existsByNameAndTenantId(String name, UUID tenantId);

    @Query("""
            SELECT DISTINCT f FROM FormDefinitionEntity f
            LEFT JOIN FETCH f.allowedProviders p
            LEFT JOIN FETCH p.groupMapping gm
            LEFT JOIN FETCH gm.group
            WHERE f.tenantId = :tenantId AND f.name = :name
        """)
    Optional<FormDefinitionEntity> findByIdWithAuthDetails(
            @Param("name") String name,
            @Param("tenantId") UUID tenantId
        );

}
