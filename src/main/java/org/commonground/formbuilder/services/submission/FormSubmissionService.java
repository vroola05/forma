package org.commonground.formbuilder.services.submission;

import java.util.UUID;

import org.commonground.formbuilder.database.dao.submission.FormSubmissionEntity;
import org.commonground.formbuilder.model.form.fields.Form;

public interface FormSubmissionService {
    public FormSubmissionEntity getFormSubmissionEntity(UUID id);
    public UUID save(UUID tenantId, Form form);
}
