package org.commonground.forma.services.submission;

import java.util.UUID;

import org.commonground.forma.database.dao.submission.FormSubmissionEntity;
import org.commonground.forma.model.form.fields.Form;

public interface FormSubmissionService {
    public FormSubmissionEntity getFormSubmissionEntity(UUID id);
    public UUID save(UUID tenantId, Form form);
}
