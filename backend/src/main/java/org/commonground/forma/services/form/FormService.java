package org.commonground.forma.services.form;

import java.util.List;
import java.util.UUID;

import org.commonground.forma.database.dao.definition.FormDefinitionEntity;
import org.commonground.forma.model.form.FormAuthentication;
import org.commonground.forma.model.form.FormList;
import org.commonground.forma.model.form.FormWrapper;

public interface FormService {
    public List<FormList> list();
    public FormDefinitionEntity getEntity(UUID tenantId, String formName);
    public FormWrapper get(UUID tenantId, String formName);
    public FormAuthentication getFormAuthentication(UUID tenantId, String formName);
    public FormWrapper save(UUID tenantId, FormWrapper formWrapper);
}
