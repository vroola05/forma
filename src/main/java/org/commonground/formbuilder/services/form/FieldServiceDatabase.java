package org.commonground.formbuilder.services.form;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.commonground.formbuilder.database.dao.definition.FormFieldDefinitionEntity;
import org.commonground.formbuilder.database.dao.definition.FormTabDefinitionEntity;
import org.commonground.formbuilder.database.repository.FormFieldDefinitionRepository;
import org.commonground.formbuilder.model.form.CheckboxField;
import org.commonground.formbuilder.model.form.Field;
import org.commonground.formbuilder.model.form.FieldType;
import org.commonground.formbuilder.model.form.FormGroup;
import org.commonground.formbuilder.model.form.RadioField;
import org.commonground.formbuilder.model.form.SelectField;
import org.commonground.formbuilder.model.form.TextField;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import jakarta.transaction.Transactional;

@Service
public class FieldServiceDatabase implements FieldService {
    private final FormFieldDefinitionRepository formFieldDefinitionRepository;

    public FieldServiceDatabase(
            FormFieldDefinitionRepository formFieldDefinitionRepository) {
        this.formFieldDefinitionRepository = formFieldDefinitionRepository;
    }

    public FormFieldDefinitionEntity getFormFieldDefinitionById(UUID id) {
        return this.formFieldDefinitionRepository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Form field niet gevonden"));
    }

    @Override
    public List<Field> get(UUID tabPageId) {
        return getFields(tabPageId, null);
    }

    private List<Field> getFields(UUID tabPageId, UUID parentFieldId) {
        List<Field> fields = new ArrayList<>();
        List<FormFieldDefinitionEntity> formFieldDefinitionEntities = 
                parentFieldId != null ? 
                        this.formFieldDefinitionRepository.findAllByParentIdOrderBySortOrderAsc(parentFieldId) : 
                        this.formFieldDefinitionRepository.findAllByTabIdOrderBySortOrderAsc(tabPageId);
        for (FormFieldDefinitionEntity formFieldDefinitionEntity : formFieldDefinitionEntities) {
            
            FieldType fieldType = FieldType.valueOf(formFieldDefinitionEntity.getType());
            if (fieldType == FieldType.FORM_GROUP) {
                FormGroup formGroup = new FormGroup();
                formGroup.setId(formFieldDefinitionEntity.getId());
                formGroup.setName(formFieldDefinitionEntity.getName());
                formGroup.setLabel(formFieldDefinitionEntity.getLabel());
                formGroup.setClasses(formFieldDefinitionEntity.getClasses());
                formGroup.setType(FieldType.FORM_GROUP);
                formGroup.setMetadata(formFieldDefinitionEntity.getMetadata());
                formGroup.setCondition(formFieldDefinitionEntity.getCondition());
                formGroup.setShow(formFieldDefinitionEntity.getShow());
                fields.add(formGroup);

                formGroup.setFields(getFields(null, formFieldDefinitionEntity.getId()));
            } else {
                Field field;
                if (isTextField(fieldType)) {
                    TextField textField = new TextField();
                    textField.setPlaceholder(formFieldDefinitionEntity.getPlaceholder());
                    textField.setValue(formFieldDefinitionEntity.getValue());
                    textField.setReadonly(formFieldDefinitionEntity.getReadonly());
                    textField.setRequired(formFieldDefinitionEntity.getRequired());
                    textField.setMinlength(formFieldDefinitionEntity.getMinLength());
                    textField.setMaxlength(formFieldDefinitionEntity.getMaxLength());

                    field = textField;

                    fields.add(textField);
                } else if (fieldType == FieldType.CHECKBOX) {
                    CheckboxField checkboxField = new CheckboxField();
                    checkboxField.setPlaceholder(formFieldDefinitionEntity.getPlaceholder());
                    checkboxField.setValue(formFieldDefinitionEntity.getValue());
                    checkboxField.setReadonly(formFieldDefinitionEntity.getReadonly());
                    checkboxField.setRequired(formFieldDefinitionEntity.getRequired());
                    checkboxField.setOptions(formFieldDefinitionEntity.getOptions());
                    checkboxField.setValues(formFieldDefinitionEntity.getValues());

                    field = checkboxField;

                    fields.add(checkboxField);
                } else if (fieldType == FieldType.RADIO) {
                    RadioField radioField = new RadioField();
                    radioField.setPlaceholder(formFieldDefinitionEntity.getPlaceholder());
                    radioField.setReadonly(formFieldDefinitionEntity.getReadonly());
                    radioField.setRequired(formFieldDefinitionEntity.getRequired());
                    radioField.setValue(formFieldDefinitionEntity.getValue());
                    radioField.setOptions(formFieldDefinitionEntity.getOptions());
                    radioField.setValues(formFieldDefinitionEntity.getValues());

                    field = radioField;

                    fields.add(radioField);
                } else if (fieldType == FieldType.SELECT) {
                    SelectField selectField = new SelectField();
                    selectField.setPlaceholder(formFieldDefinitionEntity.getPlaceholder());
                    selectField.setValue(formFieldDefinitionEntity.getValue());
                    selectField.setReadonly(formFieldDefinitionEntity.getReadonly());
                    selectField.setRequired(formFieldDefinitionEntity.getRequired());
                    selectField.setOptions(formFieldDefinitionEntity.getOptions());
                    selectField.setValues(formFieldDefinitionEntity.getValues());

                    field = selectField;

                    fields.add(selectField);
                } else {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported field type");
                }

                field.setId(formFieldDefinitionEntity.getId());
                field.setName(formFieldDefinitionEntity.getName());
                field.setType(fieldType);
                field.setLabel(formFieldDefinitionEntity.getLabel());
                field.setClasses(formFieldDefinitionEntity.getClasses());
                
                field.setMetadata(formFieldDefinitionEntity.getMetadata());
                field.setCondition(formFieldDefinitionEntity.getCondition());
                field.setShow(formFieldDefinitionEntity.getShow());
                
            }
        }
        return fields;
    }

    @Override
    public Field get(UUID tabPageId, UUID id) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'get'");
        
    }

    @Override
    @Transactional
    public void save(FormTabDefinitionEntity formTabDefinitionEntity, Field field, int index) {
        saveStructure(formTabDefinitionEntity, null, field, index);
    }

    private void saveStructure(FormTabDefinitionEntity formTabDefinitionEntity, FormFieldDefinitionEntity parentFieldDefinition, Field field, int index) {
        FormFieldDefinitionEntity formFieldDefinitionEntity = (field.getId() == null) ? new FormFieldDefinitionEntity() : getFormFieldDefinitionById(field.getId());

        formFieldDefinitionEntity.setId(field.getId() == null ? UUID.randomUUID() : field.getId());
        formFieldDefinitionEntity.setName(field.getName());
        formFieldDefinitionEntity.setLabel(field.getLabel());
        formFieldDefinitionEntity.setType(field.getType().name());
        formFieldDefinitionEntity.setClasses(field.getClasses());
        formFieldDefinitionEntity.setMetadata(field.getMetadata());
        formFieldDefinitionEntity.setCondition(field.getCondition());
        formFieldDefinitionEntity.setShow(field.isShow());
        formFieldDefinitionEntity.setSortOrder(index);

        if (field.getType() == FieldType.FORM_GROUP) {
            FormGroup formGroup = (FormGroup) field;

            formFieldDefinitionEntity.setTab(formTabDefinitionEntity);

            int sortOrderFormGroupField = 0;
            for (Field formGroupField : formGroup.getFields()) {
                if (formGroupField.getType() == FieldType.FORM_GROUP) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No inner form groups allowed");
                }
                this.formFieldDefinitionRepository.save(formFieldDefinitionEntity);
                saveStructure(null, formFieldDefinitionEntity, formGroupField, sortOrderFormGroupField++);
            }
        } else {
            formFieldDefinitionEntity.setTab(formTabDefinitionEntity);
            formFieldDefinitionEntity.setParent(parentFieldDefinition);

            setFormFieldDefinitionEntityProperties(formFieldDefinitionEntity, field);
        
            this.formFieldDefinitionRepository.save(formFieldDefinitionEntity);
        }

    }

    private void setFormFieldDefinitionEntityProperties(FormFieldDefinitionEntity formFieldDefinitionEntity, Field field) {
        if (isTextField(field.getType())) {
            TextField textField = (TextField) field;
            formFieldDefinitionEntity.setValue(textField.getValue());
            formFieldDefinitionEntity.setPlaceholder(textField.getPlaceholder());
            formFieldDefinitionEntity.setReadonly(textField.getReadonly());
            formFieldDefinitionEntity.setRequired(textField.getRequired());
            formFieldDefinitionEntity.setMinLength(textField.getMinlength());
            formFieldDefinitionEntity.setMaxLength(textField.getMaxlength());
        } else if (field.getType() == FieldType.CHECKBOX) {
            CheckboxField checkboxField = (CheckboxField) field;
            formFieldDefinitionEntity.setValue(checkboxField.getValue());
            formFieldDefinitionEntity.setPlaceholder(checkboxField.getPlaceholder());
            formFieldDefinitionEntity.setReadonly(checkboxField.getReadonly());
            formFieldDefinitionEntity.setRequired(checkboxField.getRequired());
            formFieldDefinitionEntity.setOptions(checkboxField.getOptions());
            formFieldDefinitionEntity.setValues(checkboxField.getValues());
        } else if (field.getType() == FieldType.RADIO) {
            RadioField radioField = (RadioField) field;
            formFieldDefinitionEntity.setValue(radioField.getValue());
            formFieldDefinitionEntity.setPlaceholder(radioField.getPlaceholder());
            formFieldDefinitionEntity.setReadonly(radioField.getReadonly());
            formFieldDefinitionEntity.setRequired(radioField.getRequired());
            formFieldDefinitionEntity.setOptions(radioField.getOptions());
            formFieldDefinitionEntity.setValues(radioField.getValues());
        } else if (field.getType() == FieldType.SELECT) {
            SelectField selectField = (SelectField) field;
            formFieldDefinitionEntity.setValue(selectField.getValue());
            formFieldDefinitionEntity.setPlaceholder(selectField.getPlaceholder());
            formFieldDefinitionEntity.setReadonly(selectField.getReadonly());
            formFieldDefinitionEntity.setRequired(selectField.getRequired());
            formFieldDefinitionEntity.setOptions(selectField.getOptions());
            formFieldDefinitionEntity.setValues(selectField.getValues());
        }
    }

    public boolean isTextField(FieldType fieldType) {
        return fieldType == FieldType.LABEL
            || fieldType == FieldType.TEXT
            || fieldType == FieldType.TEXTAREA
            || fieldType == FieldType.NUMBER
            || fieldType == FieldType.VALUTA
            || fieldType == FieldType.DATE
            || fieldType == FieldType.HIDDEN;
    }

}
