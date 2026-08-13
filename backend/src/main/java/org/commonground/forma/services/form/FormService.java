package org.commonground.forma.services.form;

import java.util.List;
import java.util.UUID;

import org.commonground.forma.model.form.FormList;
import org.commonground.forma.model.form.FormWrapper;

public interface FormService {
    public List<FormList> list();
    public FormWrapper get(String formName);

    public FormWrapper save(UUID tenantId, FormWrapper formWrapper);
}
