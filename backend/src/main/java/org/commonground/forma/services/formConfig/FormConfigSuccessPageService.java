package org.commonground.forma.services.formConfig;

import java.util.UUID;

import org.commonground.forma.database.dao.definition.FormDefinitionEntity;
import org.commonground.forma.model.form.FormConfigSuccessPage;
import org.commonground.forma.model.form.FormWrapper;
import org.commonground.forma.model.form.fields.Form;

public interface FormConfigSuccessPageService {
    public FormConfigSuccessPage get(UUID id);
    public String transform(FormWrapper formWrapper, Form form);
    public String save(FormDefinitionEntity formDefinitionEntity, FormConfigSuccessPage formConfigSuccessPage);
}
