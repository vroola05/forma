package org.commonground.forma.database.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.commonground.forma.database.dao.definition.FormFieldDefinitionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface FormFieldDefinitionRepository extends JpaRepository<FormFieldDefinitionEntity, UUID> {

    @Query("SELECT f FROM FormFieldDefinitionEntity f " +
           "JOIN f.tab t " +
           "WHERE f.id = :id " +
           "AND t.tenantId = :tenantId")
    Optional<FormFieldDefinitionEntity> findFieldById(
        @Param("id") UUID id,
        @Param("tenantId") UUID tenantId
    );

    @Query("SELECT f FROM FormFieldDefinitionEntity f " +
           "JOIN f.tab t " +
           "WHERE t.id = :tabId AND t.tenantId = :tenantId " +
           "AND f.parent IS NULL " +
           "ORDER BY f.sortOrder ASC")
    List<FormFieldDefinitionEntity> findAllByRootId(
        @Param("tabId") UUID tabId,
        @Param("tenantId") UUID tenantId
    );

    @Query("SELECT f FROM FormFieldDefinitionEntity f " +
           "JOIN f.tab t " +
           "WHERE t.id = :tabId AND t.tenantId = :tenantId " +
           "AND f.parent.id = :parentFieldId " +
           "ORDER BY f.sortOrder ASC")
    List<FormFieldDefinitionEntity> findAllByParentId(
        @Param("tabId") UUID tabId,
        @Param("parentFieldId") UUID parentFieldId,
        @Param("tenantId") UUID tenantId);
}
