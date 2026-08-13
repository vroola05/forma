package org.commonground.forma;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.commonground.forma.exceptions.FieldValidationException;
import org.commonground.forma.exceptions.FormFieldError;
import org.commonground.forma.exceptions.FormValidationException;
import org.commonground.forma.model.form.condition.Condition;
import org.commonground.forma.model.form.constants.FieldType;
import org.commonground.forma.model.form.fields.Field;
import org.commonground.forma.model.form.fields.Form;
import org.commonground.forma.util.condition.ConditionParser;

public class FormValidator {
    public static void validate(Form form, Form definition) {

        if (form.getName() == null || !form.getName().equals(definition.getName())) {
            throwValidationError(definition.getName(), "{form.definition.error.not_found}");
        }

        if (form.getId() == null || !form.getId().equals(definition.getId())) {
            throwValidationError(definition.getName(), "{form.definition.error.not_found}");
        }

        if (form.getClientSessionId() == null) {
            throwValidationError(form.getClientSessionId().toString(), "{generic.error.internal}");
        }

        validateTabs(definition, form);
    }

    private static void validateTabs(Form definition, Form form) {
        List<Field> fieldDefinitions = definition.getFields();
        for (int index = 0; index < fieldDefinitions.size(); index++) {
            Field fieldDefinition = fieldDefinitions.get(index);

            Optional<Field> fieldOptional = form.getField(fieldDefinition.getName());
            if (fieldOptional.isEmpty()) {
                throwValidationError(fieldDefinition.getName(), String.format("De set {} is niet gevonden", fieldDefinition.getLabel()));
            }

            validateTab("fields." + index + ".", form, fieldDefinition, fieldOptional.get());
        }
    }

    private static void validateTab(String path, Form form, Field definition, Field field) {
        field.setShow(checkShowConditions(form, definition.getCondition()));
        // Only validate when visible
        if (!field.isShow()) {
            return;
        }

        validateFields(path, form, definition.getFields(), field);
    }

    private static void validateFields(String path, Form form, List<Field> fieldsDefinition, Field parentField) {
        List<FormFieldError> fieldErrors = new ArrayList<>();

        for (int index = 0; index < fieldsDefinition.size(); index++) {
            Field fieldDef = fieldsDefinition.get(index);

            String currentfield = path + "fields." + index + "." + fieldDef.getName();
            Optional<Field> fieldOptional = parentField.getField(fieldDef.getName());
            if (fieldOptional.isEmpty()) {

                throwValidationError(currentfield, String.format("De set {} is niet gevonden", fieldDef.getLabel()));
            }
            
            try {
                validateField(currentfield, form, fieldDef, fieldOptional.get());
            } catch (FieldValidationException e) {
            
                fieldErrors.add(new FormFieldError(currentfield, currentfield, e.getMessage(), e.getArgs()));
            }
        }

        if (!fieldErrors.isEmpty()) {
            throw new FormValidationException(fieldErrors);
        }
    }

    private static void validateField(String path, Form form, Field fieldDefinition, Field field) throws FieldValidationException {
        field.setShow(checkShowConditions(form, fieldDefinition.getCondition()));
        if (!field.isShow()) {
            return;
        }

        if (FieldType.REPEATING_GROUP.equals(field.getType())) {

        } else if (FieldType.FORM_GROUP.equals(field.getType())) {

        } else if (FieldType.SELECT.equals(field.getType()) || FieldType.PASSWORD.equals(field.getType()) || FieldType.CHECKBOX.equals(field.getType()) || FieldType.FILE.equals(field.getType())) {
            fieldDefinition.validate(field.getValues());
        } else {
            fieldDefinition.validate(field.getValue());
        }

        if (fieldDefinition.getFields() != null && !fieldDefinition.getFields().isEmpty()) {
            validateFields(path, form, fieldDefinition.getFields(), field);
        }
    }

    private static void throwValidationError(String type, String message) {
        throw new FormValidationException(List.of(new FormFieldError(type, type, message)));
    }

    /**
     * Checks if a field is hidden based on its value. If a field is hidden it is skipped in the further proces.
     * @param form
     * @param condition
     * @return
     */
    private static boolean checkShowConditions(Form form, Condition condition) {
        if (condition != null) {
            return ConditionParser.checkCondition(form, condition);
        }
        return true;
    }
}
