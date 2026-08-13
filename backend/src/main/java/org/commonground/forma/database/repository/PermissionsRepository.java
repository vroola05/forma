package org.commonground.forma.database.repository;

import java.util.List;

import org.commonground.forma.database.dao.settings.PermissionEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PermissionsRepository extends JpaRepository<PermissionEntity, String> {
    List<PermissionEntity> findAllByIdNotLikeOrderByIdAsc(String id);
        
}
