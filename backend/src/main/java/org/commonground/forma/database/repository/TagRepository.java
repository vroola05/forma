package org.commonground.forma.database.repository;

import java.util.List;
import java.util.UUID;

import org.commonground.forma.database.dao.definition.TagEntity;
import org.commonground.forma.database.dao.definition.TagId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TagRepository extends JpaRepository<TagEntity, TagId> {

    List<TagEntity> findAllById_TenantId(UUID tenantId);
}
