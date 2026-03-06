package org.commonground.formbuilder.services.form;

import java.util.List;

import org.commonground.formbuilder.model.FormList;
import org.commonground.formbuilder.model.FormWrapper;

public interface FormService {
    public List<FormList> list();
    public FormWrapper get(String formName);
    public String save(FormWrapper formWrapper);
}
