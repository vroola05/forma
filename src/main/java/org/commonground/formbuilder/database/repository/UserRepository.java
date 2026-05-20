package org.commonground.formbuilder.database.repository;

import java.util.Optional;
import java.util.UUID;

import org.commonground.formbuilder.database.dao.settings.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<UserEntity, UUID> {
    Optional<UserEntity> findByUsername(String username);
    
    Optional<UserEntity> findByIdAndTenantId(UUID id, UUID tenantId);
    Optional<UserEntity> findByUsernameAndTenantId(String username, UUID tenantId);
    
    // Vind een globale admin (die heeft vaak geen tenantSlug)
    Optional<UserEntity> findByUsernameAndTenantIdIsNull(String username);
    
}
