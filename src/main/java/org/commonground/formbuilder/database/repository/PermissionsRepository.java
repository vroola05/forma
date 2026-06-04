package org.commonground.formbuilder.database.repository;

import java.util.List;

import org.commonground.formbuilder.database.dao.settings.PermissionEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PermissionsRepository extends JpaRepository<PermissionEntity, String> {
    List<PermissionEntity> findAllByIdNotLikeOrderByIdAsc(String id);
        
}
