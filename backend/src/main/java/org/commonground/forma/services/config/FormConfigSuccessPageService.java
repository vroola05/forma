package org.commonground.forma.services.config;

import java.util.UUID;

import org.commonground.forma.database.dao.definition.FormConfigSuccessPageEntity;
import org.commonground.forma.database.dao.definition.FormDefinitionEntity;
import org.commonground.forma.model.form.FormConfigSuccessPage;
import org.commonground.forma.model.form.FormWrapper;
import org.commonground.forma.model.form.fields.Form;

public interface FormConfigSuccessPageService {
    public FormConfigSuccessPage getByFormId(UUID id);
    public FormConfigSuccessPage getByTenantId(UUID id);
    public String transform(FormWrapper formWrapper, Form form);
    public FormConfigSuccessPage saveByForm(FormDefinitionEntity formDefinitionEntity, FormConfigSuccessPage formConfigSuccessPage);
    public FormConfigSuccessPage saveByTenant(FormConfigSuccessPage formConfigSuccessPage);
    public void delete(FormConfigSuccessPageEntity formConfigSuccessPageEntity);
}
