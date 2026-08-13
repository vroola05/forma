package org.commonground.forma.services.form;

import java.util.List;
import java.util.UUID;

import org.commonground.forma.database.dao.definition.FormFieldDefinitionEntity;
import org.commonground.forma.model.form.fields.Field;

public interface FieldService {
    public FormFieldDefinitionEntity getFormFieldDefinitionEntityById(UUID id);
    public List<Field> get(UUID tabPageId);
    public Field get(UUID tabPageId, UUID id);
    
}
