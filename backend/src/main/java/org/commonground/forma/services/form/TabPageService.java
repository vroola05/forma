package org.commonground.forma.services.form;

import java.util.List;
import java.util.UUID;

import org.commonground.forma.database.dao.definition.FormDefinitionEntity;
import org.commonground.forma.model.form.fields.Field;
import org.commonground.forma.model.form.fields.TabPage;

public interface TabPageService {
    public List<Field> get(UUID formId);
    public TabPage get(UUID formId, UUID id);
    public void save(FormDefinitionEntity formDefinitionEntity, TabPage tabPage, int index);
}
