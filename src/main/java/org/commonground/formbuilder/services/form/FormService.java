package org.commonground.formbuilder.services.form;

import java.util.List;
import java.util.UUID;

import org.commonground.formbuilder.database.dao.definition.FormDefinitionEntity;
import org.commonground.formbuilder.model.FormList;
import org.commonground.formbuilder.model.FormWrapper;

public interface FormService {
    public List<FormList> list();
    public FormWrapper get(String formName);
    public FormWrapper transform(FormDefinitionEntity formDefinitionEntity);
    public FormWrapper save(UUID tenantId, FormWrapper formWrapper);
}
