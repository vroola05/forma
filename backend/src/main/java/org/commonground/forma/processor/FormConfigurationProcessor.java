package org.commonground.forma.processor;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.commonground.forma.database.dao.definition.FormConfigSuccessPageEntity;
import org.commonground.forma.database.dao.definition.FormDefinitionEntity;
import org.commonground.forma.database.dao.definition.FormTabDefinitionEntity;
import org.commonground.forma.database.dao.definition.FormTabInstanceDefinitionEntity;
import org.commonground.forma.database.dao.definition.FormVariableEntity;
import org.commonground.forma.database.dao.definition.FormVariableValueEntity;
import org.commonground.forma.database.dao.definition.TagEntity;
import org.commonground.forma.database.dao.definition.TagId;
import org.commonground.forma.database.repository.TagRepository;
import org.commonground.forma.mapper.SuccessPageMapper;
import org.commonground.forma.mapper.TabPageMapper;
import org.commonground.forma.model.form.FormConfig;
import org.commonground.forma.model.form.FormConfigSuccessPage;
import org.commonground.forma.model.form.FormWrapper;
import org.commonground.forma.model.form.Variable;
import org.commonground.forma.model.form.VariableValue;
import org.commonground.forma.model.form.fields.Field;
import org.commonground.forma.model.form.fields.TabPage;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

@Component
public class FormConfigurationProcessor {

    private final TagRepository tagRepository;
    
    private final TabPageMapper tabPageMapper;
    private final FormFieldConfigurationProcessor fieldConfigurationProcessor;
    private final SuccessPageMapper successPageMapper;

    public FormConfigurationProcessor(
            TagRepository tagRepository,
            TabPageMapper tabPageMapper,
            FormFieldConfigurationProcessor fieldConfigurationProcessor,
            SuccessPageMapper successPageMapper) {
        this.tagRepository = tagRepository;
        this.tabPageMapper = tabPageMapper;
        this.fieldConfigurationProcessor = fieldConfigurationProcessor;
        this.successPageMapper = successPageMapper;
    }

    public void processUpdate(FormDefinitionEntity formDefinitionEntity, FormWrapper wrapper)  {
        
        processTabs(formDefinitionEntity, wrapper);
        processSuccessPage(formDefinitionEntity, wrapper);
        processFormVariables(formDefinitionEntity, wrapper);
    }

    private void processTabs(FormDefinitionEntity formDefinitionEntity, FormWrapper wrapper) {
        // Remove tabs that are deleted from the dto object
        formDefinitionEntity.retainTabs(wrapper.getIncomingTabIds());

        // Create/update tabs that are added to the dto object
        int sortOrderTab = 0;
        for (Field field : wrapper.getForm().getFields()) {
            if (field instanceof TabPage tabPage) {
                processTab(formDefinitionEntity, tabPage, sortOrderTab++);
            }
        }
    }

    private void processTab(FormDefinitionEntity formEntity, TabPage tabPage, int sortOrder) {
        FormTabDefinitionEntity tabDefEntity;
        FormTabInstanceDefinitionEntity instanceEntity;

        if (tabPage.getId() == null) {
            instanceEntity = new FormTabInstanceDefinitionEntity();
            instanceEntity.setSortOrder(sortOrder);

            tabDefEntity = this.tabPageMapper.toNewEntity(tabPage);
            tabDefEntity.setTenantId(formEntity.getTenantId());
            
            instanceEntity.setTab(tabDefEntity);
            formEntity.addTabInstance(instanceEntity);
        } else {
            instanceEntity = formEntity.getTabs().stream()
                    .filter(tab -> tab.getTab().getId().equals(tabPage.getId()))
                    .findFirst()
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tab niet gevonden"));
            
            instanceEntity.setSortOrder(sortOrder);
            tabDefEntity = instanceEntity.getTab();
            this.tabPageMapper.updateEntityFromDto(tabDefEntity, tabPage);
            tabDefEntity.setTenantId(formEntity.getTenantId());
        }

        fieldConfigurationProcessor.syncFieldsForTab(tabDefEntity, tabPage.getFields());
    }

    

    /**
     * Update the successpage in the 
     * @param formDefinitionEntity
     * @param wrapper
     */
    private void processSuccessPage(FormDefinitionEntity formDefinitionEntity, FormWrapper wrapper) {
        FormConfig config = wrapper.getFormConfig();

        
        // Check if the success-page needs to be removed
        boolean removeSuccessPage = isSuccessPageMissing(wrapper);
        if (removeSuccessPage) {
            FormConfigSuccessPageEntity formConfigSuccessPageEntity = formDefinitionEntity.getSuccessPage();
            if (formConfigSuccessPageEntity != null) {
                formDefinitionEntity.clearSuccessPage();
                config.setFormConfigSuccessPage(null);
            }
            return;
        }
        
        FormConfigSuccessPage formConfigSuccessPage = config.getFormConfigSuccessPage();
        if (formDefinitionEntity.getSuccessPage() != null) {
            successPageMapper.updateEntityFromDto(formDefinitionEntity.getSuccessPage(), formConfigSuccessPage);
        } else {
            FormConfigSuccessPageEntity formConfigSuccessPageEntity = successPageMapper.toNewEntity(formConfigSuccessPage, formDefinitionEntity.getTenantId(), false);
            formDefinitionEntity.setSuccessPage(formConfigSuccessPageEntity);
        }
    }

    private boolean isSuccessPageMissing(FormWrapper wrapper) {
        return wrapper.getFormConfig() == null
                || wrapper.getFormConfig().getFormConfigSuccessPage() == null
                || wrapper.getFormConfig().getFormConfigSuccessPage().getCustomSuccessPage() == null
                || !wrapper.getFormConfig().getFormConfigSuccessPage().getCustomSuccessPage();
    }


    private void processFormVariables(FormDefinitionEntity formDefinitionEntity, FormWrapper wrapper) {
        List<Variable> variables;

        FormConfig config = wrapper.getFormConfig();
        if (isVariablesMissing(wrapper)) {
            variables = new ArrayList<>();
        } else {
            variables = config.getVariables();
        }

        formDefinitionEntity.retainVariables(getIncomingIds(variables, Variable::getId));

        List<TagEntity> allTenantTags = tagRepository.findAllById_TenantId(formDefinitionEntity.getTenantId());

        List<FormVariableEntity> formVariableEntities = formDefinitionEntity.getVariables();
        for(Variable variable : variables) {
            FormVariableEntity formVariableEntity;

            if (variable.getId() == null) {
                formVariableEntity = new FormVariableEntity();
                formDefinitionEntity.addFormVariable(formVariableEntity);
                formVariableEntity.setTenantId(formDefinitionEntity.getTenantId());
                formVariableEntity.setId(UUID.randomUUID());

            } else {
                formVariableEntity = formVariableEntities.stream()
                    .filter(tab -> tab.getId().equals(variable.getId()))
                    .findFirst()
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Variabele niet gevonden"));
            }

            formVariableEntity.setVariableName(variable.getName());
            updateVariableTags(formDefinitionEntity.getTenantId(), formVariableEntity, variable.getTags(), allTenantTags);

            updateVariableValues(formDefinitionEntity, formVariableEntity, variable);
        }
    }

    private void updateVariableValues(FormDefinitionEntity formDefinitionEntity, FormVariableEntity formVariableEntity,
            Variable variable) {

        formVariableEntity.retainValues(getIncomingIds(variable.getValues(), VariableValue::getId));

        for(VariableValue value : variable.getValues()) {
            FormVariableValueEntity  formVariableValueEntity;
            if (value.getId() == null) {
                formVariableValueEntity = new FormVariableValueEntity();
                formVariableValueEntity.setId(UUID.randomUUID());
                formVariableEntity.addValue(formVariableValueEntity);
            } else {
                 formVariableValueEntity = formVariableEntity.getValues().stream()
                        .filter(valueEntity -> valueEntity.getId() == value.getId()).findFirst()
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Variabele niet gevonden"));;
            }
            formVariableValueEntity.setVariableValue(value.getValue());
            formVariableValueEntity.setVariableCondition(value.getConditions());
        }
    }

    private boolean isVariablesMissing(FormWrapper wrapper) {
        return wrapper.getFormConfig() == null || wrapper.getFormConfig().getVariables() == null;
    }

    private void updateVariableTags(UUID tenantId, FormVariableEntity instanceEntity, List<String> variables, List<TagEntity> allTenantTags ) {
        List<String> cleanedInputs = variables.stream()
                        .map(name -> name.trim().toLowerCase())
                        .distinct().toList();

        List<String> currentlyLinkedNames = instanceEntity.getTags().stream()
                .map(tag -> tag.getId().getTagName()).toList();

        List<String> tagsToCheckInDb = cleanedInputs.stream()
                .filter(name -> !currentlyLinkedNames.contains(name)).toList();

        Map<String, TagEntity> tenantTagMap = allTenantTags.stream()
            .collect(Collectors.toMap(tag -> tag.getId().getTagName(), tag -> tag));

        for (String tag: tagsToCheckInDb) {
            if (currentlyLinkedNames.contains(tag)) {
                continue;
            }
            
            TagEntity tagEntity = tenantTagMap.get(tag);
            if (tagEntity != null) {
                instanceEntity.addTag(tagEntity);
            } else {
                tagEntity = new TagEntity();

                tagEntity.setId(new TagId(tenantId, tag));

                instanceEntity.addTag(tagEntity);
            }
        }
    }

    public <T> List<UUID> getIncomingIds(List<T> entities, Function<T, UUID> idExtractor) {
    if (entities == null) {
        return List.of();
    }
    return entities.stream()
            .map(idExtractor)
            .filter(Objects::nonNull)
            .toList();
    }
}
