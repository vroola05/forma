package org.commonground.formbuilder.services.form;

import java.util.List;
import java.util.UUID;

import org.commonground.formbuilder.database.dao.definition.FormDefinitionEntity;
import org.commonground.formbuilder.model.form.TabPage;

public interface TabPageService {
    public List<TabPage> get(UUID formId);
    public TabPage get(UUID formId, UUID id);
    public void save(FormDefinitionEntity formDefinitionEntity, TabPage tabPage, int index);
}
