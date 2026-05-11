package org.commonground.formbuilder.services.formConfig;

import java.util.UUID;

import org.commonground.formbuilder.database.dao.definition.FormDefinitionEntity;
import org.commonground.formbuilder.model.FormConfigSuccessPage;
import org.commonground.formbuilder.model.FormWrapper;
import org.commonground.formbuilder.model.form.Form;

public interface FormConfigSuccessPageService {
    public FormConfigSuccessPage get(UUID id);
    public String transform(FormWrapper formWrapper, Form form);
    public String save(FormDefinitionEntity formDefinitionEntity, FormConfigSuccessPage formConfigSuccessPage);
}
