package org.commonground.forma.mapper;

import java.util.List;
import java.util.UUID;

import org.commonground.forma.database.dao.definition.FormFieldDefinitionEntity;
import org.commonground.forma.database.dao.definition.properties.FieldProperties;
import org.commonground.forma.database.dao.definition.properties.FileFieldProperties;
import org.commonground.forma.model.form.constants.FieldType;
import org.commonground.forma.model.form.fields.CheckboxField;
import org.commonground.forma.model.form.fields.ColorField;
import org.commonground.forma.model.form.fields.DualListboxField;
import org.commonground.forma.model.form.fields.Field;
import org.commonground.forma.model.form.fields.FileField;
import org.commonground.forma.model.form.fields.FormGroup;
import org.commonground.forma.model.form.fields.RadioField;
import org.commonground.forma.model.form.fields.SelectField;
import org.commonground.forma.model.form.fields.TextField;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

@Component
public class FieldMapper {
    
    public FormFieldDefinitionEntity toNewEntity(Field dto, int index) {
        FormFieldDefinitionEntity entity = new FormFieldDefinitionEntity();
        entity.setId(UUID.randomUUID());

        setFormFieldDefinitionEntityProperties(entity, dto, index);

        return entity;
    }

    public void updateEntityFromDto(FormFieldDefinitionEntity entity, Field dto, int index) {
        setFormFieldDefinitionEntityProperties(entity, dto, index);
    }

    private void setFormFieldDefinitionEntityProperties(FormFieldDefinitionEntity entity, Field dto, int index) {
        entity.setName(dto.getName());
        entity.setLabel(dto.getLabel());
        entity.setType(dto.getType().name());
        entity.setClasses(dto.getClasses());
        entity.setMetadata(dto.getMetadata());
        entity.setCondition(dto.getCondition() == null || dto.getCondition().isEmpty() ? null : dto.getCondition());
        entity.setShow(dto.isShow());
        entity.setSortOrder(index);

        if (isTextField(dto.getType())) {
            TextField textField = (TextField) dto;
            entity.setValue(textField.getValue());
            entity.setPlaceholder(textField.getPlaceholder());
            entity.setReadonly(textField.getReadonly());
            entity.setRequired(textField.getRequired());
            entity.setMinLength(textField.getMinLength());
            entity.setMaxLength(textField.getMaxLength());
        } else if (dto.getType() == FieldType.CHECKBOX) {
            CheckboxField checkboxField = (CheckboxField) dto;
            entity.setValue(checkboxField.getValue());
            entity.setPlaceholder(checkboxField.getPlaceholder());
            entity.setReadonly(checkboxField.getReadonly());
            entity.setRequired(checkboxField.getRequired());
            entity.setOptions(checkboxField.getOptions());
            entity.setValues(checkboxField.getValues());
        } else if (dto.getType() == FieldType.RADIO) {
            RadioField radioField = (RadioField) dto;
            entity.setValue(radioField.getValue());
            entity.setPlaceholder(radioField.getPlaceholder());
            entity.setReadonly(radioField.getReadonly());
            entity.setRequired(radioField.getRequired());
            entity.setOptions(radioField.getOptions());
            entity.setValues(radioField.getValues());
        } else if (dto.getType() == FieldType.SELECT) {
            SelectField selectField = (SelectField) dto;
            entity.setValue(selectField.getValue());
            entity.setPlaceholder(selectField.getPlaceholder());
            entity.setReadonly(selectField.getReadonly());
            entity.setRequired(selectField.getRequired());
            entity.setOptions(selectField.getOptions());
            entity.setValues(selectField.getValues());
        } else if (dto.getType() == FieldType.DUAL_LISTBOX) {
            DualListboxField selectField = (DualListboxField) dto;
            entity.setValue(selectField.getValue());
            entity.setPlaceholder(selectField.getPlaceholder());
            entity.setReadonly(selectField.getReadonly());
            entity.setRequired(selectField.getRequired());
            entity.setOptions(selectField.getOptions());
            entity.setValues(selectField.getValues());
        } else if (dto.getType() == FieldType.FILE) {
            FileField fileField = (FileField) dto;
            entity.setRequired(fileField.getRequired());

            FileFieldProperties fieldProperties = new FileFieldProperties(
                    fileField.getType().getValue(),
                    fileField.getIsMultiple(),
                    fileField.getMaxFiles(),
                    fileField.getMaxFileSize(),
                    fileField.getAllowedExtensions());
            entity.setProperties(fieldProperties);
        }
    }


    public Field toResponseDto(FormFieldDefinitionEntity entity) {
        Field field;
        FieldType fieldType = FieldType.valueOf(entity.getType());
        if (fieldType == FieldType.FORM_GROUP) {
            FormGroup formGroup = new FormGroup();
            formGroup.setId(entity.getId());
            formGroup.setName(entity.getName());
            formGroup.setLabel(entity.getLabel());
            formGroup.setClasses(entity.getClasses());
            formGroup.setType(FieldType.FORM_GROUP);
            formGroup.setMetadata(entity.getMetadata());
            formGroup.setCondition(entity.getCondition());
            formGroup.setShow(entity.getShow());

            formGroup.setFields(toResponseDtoList(entity.getChildren()));

            field = formGroup;
        } else 
        if (isTextField(fieldType)) {
            TextField textField = new TextField();
            textField.setPlaceholder(entity.getPlaceholder());
            textField.setValue(entity.getValue());
            textField.setReadonly(entity.getReadonly());
            textField.setRequired(entity.getRequired());
            textField.setMinLength(entity.getMinLength());
            textField.setMaxLength(entity.getMaxLength());

            field = textField;
        } else if (fieldType == FieldType.FILE) {
            FileField fileField = new FileField();
            fileField.setPlaceholder(entity.getPlaceholder());
            fileField.setReadonly(entity.getReadonly());
            fileField.setRequired(entity.getRequired());
            
            FileFieldProperties fieldProperties = (FileFieldProperties)entity.getProperties();
            fileField.setAllowedExtensions(fieldProperties.allowedExtensions());
            fileField.setIsMultiple(fieldProperties.isMultiple());
            fileField.setMaxFiles(fieldProperties.maxFiles());
            fileField.setMaxFileSize(fieldProperties.maxFileSize());

            field = fileField;
        } else if (fieldType == FieldType.COLOR) {
            ColorField colorField = new ColorField();
            colorField.setPlaceholder(entity.getPlaceholder());
            colorField.setValue(entity.getValue());
            colorField.setReadonly(entity.getReadonly());
            colorField.setRequired(entity.getRequired());

            field = colorField;
        } else if (fieldType == FieldType.CHECKBOX) {
            CheckboxField checkboxField = new CheckboxField();
            checkboxField.setPlaceholder(entity.getPlaceholder());
            checkboxField.setValue(entity.getValue());
            checkboxField.setReadonly(entity.getReadonly());
            checkboxField.setRequired(entity.getRequired());
            checkboxField.setOptions(entity.getOptions());
            checkboxField.setValues(entity.getValues());

            field = checkboxField;
        } else if (fieldType == FieldType.RADIO) {
            RadioField radioField = new RadioField();
            radioField.setPlaceholder(entity.getPlaceholder());
            radioField.setReadonly(entity.getReadonly());
            radioField.setRequired(entity.getRequired());
            radioField.setValue(entity.getValue());
            radioField.setOptions(entity.getOptions());
            radioField.setValues(entity.getValues());

            field = radioField;
        } else if (fieldType == FieldType.SELECT) {
            SelectField selectField = new SelectField();
            selectField.setPlaceholder(entity.getPlaceholder());
            selectField.setValue(entity.getValue());
            selectField.setReadonly(entity.getReadonly());
            selectField.setRequired(entity.getRequired());
            selectField.setOptions(entity.getOptions());
            selectField.setValues(entity.getValues());

            field = selectField;
        } else if (fieldType == FieldType.DUAL_LISTBOX) {
            DualListboxField dualListboxField = new DualListboxField();
            dualListboxField.setPlaceholder(entity.getPlaceholder());
            dualListboxField.setValue(entity.getValue());
            dualListboxField.setReadonly(entity.getReadonly());
            dualListboxField.setRequired(entity.getRequired());
            dualListboxField.setOptions(entity.getOptions());
            dualListboxField.setValues(entity.getValues());

            field = dualListboxField;
        } else {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "{form.field.error.unsupported_field_type}");
        }

        field.setId(entity.getId());
        field.setName(entity.getName());
        field.setType(fieldType);
        field.setLabel(entity.getLabel());
        field.setClasses(entity.getClasses());
        
        field.setMetadata(entity.getMetadata());
        field.setCondition(entity.getCondition());
        field.setShow(entity.getShow());
        
        return field;
    }

    public List<Field> toResponseDtoList(List<FormFieldDefinitionEntity> entities) {
        if (entities == null) {
            return null;
        }

        return entities.stream()
                .map(this::toResponseDto)
                .toList();
    }

    public boolean isTextField(FieldType fieldType) {
        return fieldType == FieldType.LABEL
            || fieldType == FieldType.TEXT
            || fieldType == FieldType.TEXTAREA
            || fieldType == FieldType.NUMBER
            || fieldType == FieldType.VALUTA
            || fieldType == FieldType.DATE
            || fieldType == FieldType.HIDDEN
            || fieldType == FieldType.LABEL
            || fieldType == FieldType.PASSWORD;
    }
}
