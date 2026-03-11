package org.commonground.formbuilder.services.submission;

import java.util.UUID;

import org.commonground.formbuilder.model.form.Field;
import org.commonground.formbuilder.model.form.Form;

public interface FormSubmissionService {
    public Field get(UUID id);
    public void save(Form form);
}
