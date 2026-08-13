package org.commonground.forma.database.repository;

import java.util.UUID;

import org.commonground.forma.database.dao.submission.FormSubmissionEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FormSubmissionRepository extends JpaRepository<FormSubmissionEntity, UUID> {
}
