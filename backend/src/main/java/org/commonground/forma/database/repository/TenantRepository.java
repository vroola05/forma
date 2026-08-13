package org.commonground.forma.database.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.commonground.forma.database.dao.settings.TenantEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TenantRepository extends JpaRepository<TenantEntity, UUID> {

    List<TenantEntity> findAllByOrderByNameAsc();


    Optional<TenantEntity> findBySlug(String slug);

    Optional<TenantEntity> findBySlugAndIdNot(String slug, UUID id);
    
}
