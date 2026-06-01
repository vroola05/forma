package org.commonground.formbuilder.database.repository;

import java.util.UUID;
import java.util.List;
import java.util.Optional;
import java.util.Collection;
import org.commonground.formbuilder.database.dao.settings.GroupEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GroupRepository extends JpaRepository<GroupEntity, UUID> {
    boolean existsByNameAndTenantId(String name, UUID tenantId);

    List<GroupEntity> findAllByTenantId(UUID tenantId);
    Optional<GroupEntity> findByTenantIdAndId(UUID tenantId, UUID id);
    List<GroupEntity> findByTenantIdAndIdIn(UUID tenantId, Collection<UUID> ids);

}
