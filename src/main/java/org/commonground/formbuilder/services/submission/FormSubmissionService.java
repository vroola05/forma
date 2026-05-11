package org.commonground.formbuilder.services.submission;

import java.util.UUID;

import org.commonground.formbuilder.database.dao.submission.FormSubmissionEntity;
import org.commonground.formbuilder.model.form.Form;

public interface FormSubmissionService {
    public FormSubmissionEntity getFormSubmissionEntity(UUID id);
    public UUID save(Form form);
}
