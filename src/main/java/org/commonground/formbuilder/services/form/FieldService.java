package org.commonground.formbuilder.services.form;

import java.util.List;
import java.util.UUID;

import org.commonground.formbuilder.database.dao.definition.FormTabDefinitionEntity;
import org.commonground.formbuilder.model.form.Field;

public interface FieldService {
    public List<Field> get(UUID tabPageId);
    public Field get(UUID tabPageId, UUID id);
    public void save(FormTabDefinitionEntity formTabDefinitionEntity, Field field, int index);
}
