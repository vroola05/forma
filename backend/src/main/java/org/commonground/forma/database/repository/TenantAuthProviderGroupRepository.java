package org.commonground.forma.database.repository;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

import org.commonground.forma.database.dao.settings.TenantAuthProviderGroupEntity;
import org.commonground.forma.database.dao.settings.TenantAuthProviderGroupId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TenantAuthProviderGroupRepository extends JpaRepository<TenantAuthProviderGroupEntity, TenantAuthProviderGroupId> {

    @Query("""
        SELECT tapg 
        FROM TenantAuthProviderGroupEntity tapg 
        JOIN FETCH tapg.group 
        WHERE tapg.id.authProviderId = :authProviderId 
          AND tapg.externalId IN :externalIds
    """)
    List<TenantAuthProviderGroupEntity> findAllWithGroupByAuthProviderIdAndExternalIds(
        @Param("authProviderId") UUID authProviderId,
        @Param("externalIds") Collection<String> externalIds
    );

    @Query("""
        SELECT tapg 
        FROM TenantAuthProviderGroupEntity tapg 
        JOIN FETCH tapg.group 
        WHERE tapg.id.authProviderId = :authProviderId
    """)
    List<TenantAuthProviderGroupEntity> findAllWithGroupByAuthProviderId(
        @Param("authProviderId") UUID authProviderId
    );
}
