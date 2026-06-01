package org.commonground.formbuilder.database.repository;

import java.util.Optional;
import java.util.UUID;

import org.commonground.formbuilder.database.dao.settings.TenantEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TenantRepository extends JpaRepository<TenantEntity, UUID> {
    Optional<TenantEntity> findBySlug(String slug);

    Optional<TenantEntity> findBySlugAndIdNot(String slug, UUID id);
    
}
