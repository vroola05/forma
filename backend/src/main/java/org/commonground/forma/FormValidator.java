package org.commonground.forma;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.commonground.forma.config.AppConstants;
import org.commonground.forma.exceptions.FieldValidationException;
import org.commonground.forma.exceptions.FormFieldError;
import org.commonground.forma.exceptions.FormValidationException;
import org.commonground.forma.model.form.condition.Condition;
import org.commonground.forma.model.form.constants.FieldType;
import org.commonground.forma.model.form.fields.Field;
import org.commonground.forma.model.form.fields.Form;
import org.commonground.forma.model.form.fields.RepeatingGroup;
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
                throwValidationError(fieldDefinition.getName(), String.format("De set {} is niet gevonden", AppConstants.getTranslation(fieldDefinition.getLabels())));
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

                String currentfield = path + "fields." + index ;
                Optional<Field> fieldOptional = parentField.getField(fieldDef.getName());
                if (fieldOptional.isEmpty()) {
                    throwValidationError(currentfield, String.format("De set {} is niet gevonden", AppConstants.getTranslation(fieldDef.getLabels())));
                }
                
                try {
                    validateField(currentfield, form, fieldDef, fieldOptional.get());
                } catch (FieldValidationException e) {
                    String errorField = currentfield + "." + fieldDef.getName();
                    fieldErrors.add(new FormFieldError(errorField, errorField, e.getMessage(), e.getArgs()));
                } catch (FormValidationException e) {
                    List<FormFieldError> errors = e.getErrors();

                    fieldErrors.addAll(errors);
                }
            }
        

        if (!fieldErrors.isEmpty()) {
            throw new FormValidationException(fieldErrors);
        }
    }

    private static void validateSet(String path, Form form, List<Field> fieldsDefinition, List<List<Field>> sets ) {
        List<FormFieldError> fieldErrors = new ArrayList<>();


        for (int setIndex = 0; setIndex < sets.size(); setIndex++) {
            List<Field> set = sets.get(setIndex);
        
            String currentSet = path + "sets." + setIndex + ".";
            for (int fieldIndex = 0; fieldIndex < fieldsDefinition.size(); fieldIndex++) {
                Field fieldDef = fieldsDefinition.get(fieldIndex);

                String currentfield = currentSet + fieldIndex + "." + fieldDef.getName();
                Optional<Field> fieldOptional = set.stream().filter(field -> fieldDef.getName().equals(field.getName())).findFirst();
                if (fieldOptional.isEmpty()) {
                    throwValidationError(currentfield, String.format("De set {} is niet gevonden", AppConstants.getTranslation(fieldDef.getLabels())));
                }

                try {
                    validateField(currentfield, form, fieldDef, fieldOptional.get());
                } catch (FieldValidationException e) {
                    fieldErrors.add(new FormFieldError(currentfield, currentfield, e.getMessage(), e.getArgs()));
                }
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
            RepeatingGroup repeatingGroupDef = (RepeatingGroup)fieldDefinition;
            RepeatingGroup repeatingGroup = (RepeatingGroup)field;

            validateSize(AppConstants.getTranslation(repeatingGroupDef.getLabels()), repeatingGroupDef.getMinLength(), repeatingGroupDef.getMaxLength(), repeatingGroup.getSets().size());

            if (fieldDefinition.getFields() != null && !fieldDefinition.getFields().isEmpty()) {
                validateSet(path + ".", form, fieldDefinition.getFields(), repeatingGroup.getSets());
            }

        } else if (FieldType.FORM_GROUP.equals(field.getType())) {
            if (fieldDefinition.getFields() != null && !fieldDefinition.getFields().isEmpty()) {
                validateFields(path + ".", form, fieldDefinition.getFields(), field);
            }
        } else if (FieldType.SELECT.equals(field.getType()) || FieldType.PASSWORD.equals(field.getType()) || FieldType.CHECKBOX.equals(field.getType()) || FieldType.FILE.equals(field.getType())) {
            fieldDefinition.validate(field.getValues());
        } else {
            fieldDefinition.validate(field.getValue());
        }
    }

    private static void validateSize(String label, Integer min, Integer max, Integer size) throws FieldValidationException {
        String labelPrefix = (label == null || label.isEmpty()) ? "" : label + " ";

        if (min != null && (size == null || size < min)) {
            throw new FieldValidationException("{form.validation.generic.minlength}", labelPrefix, min);
        }
        if (max != null && (size == null || size > max)) {
            throw new FieldValidationException("{form.validation.generic.maxlength}", labelPrefix, max);
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
