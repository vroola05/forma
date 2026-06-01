package org.commonground.formbuilder.database.repository;

import java.util.Optional;
import java.util.UUID;

import org.commonground.formbuilder.database.dao.settings.TenantUserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TenantUserRepository extends JpaRepository<TenantUserEntity, UUID> {
    Optional<TenantUserEntity> findByUsername(String username);
    
    Optional<TenantUserEntity> findByIdAndTenantId(UUID id, UUID tenantId);
    
    boolean existsByUsernameAndTenantIdAndIdNot(String username, UUID tenantId, UUID id);

    Optional<TenantUserEntity> findByUsernameAndTenantIdAndIdNot(String username, UUID tenantId, UUID id);

    boolean existsByUsernameAndTenantId(String username, UUID tenantId);
    
    Optional<TenantUserEntity> findByUsernameAndTenantId(String username, UUID tenantId);
    // Optional<TenantUserEntity> findByUsernameAndTenantIdIsNull(String username);
    

     @Query("SELECT DISTINCT u FROM TenantUserEntity u " +
           "LEFT JOIN FETCH u.groups g " +
           "LEFT JOIN FETCH g.permissions " +
           "WHERE u.username = :username AND u.tenantId = :tenantId")
    Optional<TenantUserEntity> findByUsernameAndTenantIdWithGroupsAndPermissions(
            @Param("username") String username, 
            @Param("tenantId") UUID tenantId
    );

    @Query("SELECT DISTINCT u FROM TenantUserEntity u " +
           "LEFT JOIN FETCH u.groups g " +
           "LEFT JOIN FETCH g.permissions " +
           "WHERE u.username = :username AND u.tenantId IS NULL")
    Optional<TenantUserEntity> findByUsernameAndTenantIdIsNullWithGroupsAndPermissions(
            @Param("username") String username
    );
}
