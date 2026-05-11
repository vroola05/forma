package org.commonground.formbuilder.database.repository;

import java.util.Optional;
import java.util.UUID;

import org.commonground.formbuilder.database.dao.definition.FormConfigSuccessPageEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FormConfigSuccessPageRepository extends JpaRepository<FormConfigSuccessPageEntity, UUID> {
}
