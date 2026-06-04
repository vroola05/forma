package org.commonground.formbuilder.database.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.commonground.formbuilder.database.dao.settings.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TenantUserRepository extends JpaRepository<UserEntity, UUID> {

    List<UserEntity> findAllByTenantIdOrderByNameAsc(UUID id);

    Optional<UserEntity> findByUsername(String username);
    
    Optional<UserEntity> findByIdAndTenantId(UUID id, UUID tenantId);
    
    boolean existsByUsernameAndTenantIdAndIdNot(String username, UUID tenantId, UUID id);

    Optional<UserEntity> findByUsernameAndTenantIdAndIdNot(String username, UUID tenantId, UUID id);

    boolean existsByUsernameAndTenantId(String username, UUID tenantId);
    
    Optional<UserEntity> findByUsernameAndTenantId(String username, UUID tenantId);
    // Optional<UserEntity> findByUsernameAndTenantIdIsNull(String username);
    

     @Query("SELECT DISTINCT u FROM UserEntity u " +
           "LEFT JOIN FETCH u.groups g " +
           "LEFT JOIN FETCH g.permissions " +
           "WHERE u.username = :username AND u.tenantId = :tenantId")
    Optional<UserEntity> findByUsernameAndTenantIdWithGroupsAndPermissions(
            @Param("username") String username, 
            @Param("tenantId") UUID tenantId
    );

    @Query("SELECT DISTINCT u FROM UserEntity u " +
           "LEFT JOIN FETCH u.groups g " +
           "LEFT JOIN FETCH g.permissions " +
           "WHERE u.username = :username AND u.tenantId IS NULL")
    Optional<UserEntity> findByUsernameAndTenantIdIsNullWithGroupsAndPermissions(
            @Param("username") String username
    );
}
