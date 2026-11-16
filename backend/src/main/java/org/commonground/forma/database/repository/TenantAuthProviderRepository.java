package org.commonground.forma.database.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.commonground.forma.database.dao.settings.TenantAuthProviderEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TenantAuthProviderRepository extends JpaRepository<TenantAuthProviderEntity, UUID> {
    List<TenantAuthProviderEntity> findByTenantId(UUID tenantId);
    Optional<TenantAuthProviderEntity> findByTenantIdAndId(UUID tenantId, UUID id);
    Optional<TenantAuthProviderEntity> findByTenantIdAndDisplayName(UUID tenantId, String displayName);
}
