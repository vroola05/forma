package org.commonground.forma;

import java.util.List;

import org.commonground.forma.exceptions.FormFieldError;
import org.commonground.forma.exceptions.FormValidationException;
import org.commonground.forma.model.form.FormWrapper;
import org.commonground.forma.model.form.constants.FieldType;
import org.commonground.forma.model.form.fields.Field;
import org.commonground.forma.model.form.fields.Form;


public class FormBuilderValidator {

    private static final String NAME_REGEX = "^(?=.{1,200}$)[a-z](?:[a-z0-9_-]*[a-z0-9])?$";
    private static final String LABEL_REGEX = ".{0,200}$";
    private static final String CLASSES_REGEX = "(?i)^(?:(?=.{1,200}$)[a-z][a-z0-9_-]*(?:\\s+[a-z][a-z0-9_-]*)*)?$";
    private static final String METADATA_REGEX = ".{0,10}$";

    public static void validate(FormWrapper formWrapper) {

        if (formWrapper.getForm() == null) {
            throw new FormValidationException(List.of(new FormFieldError("form", "*", "{form.validation.required.form}")));
        }

        validate(formWrapper.getForm());

    }

    public static void validate(Form form) {
        String path = "";
        if (form == null) {
            throw new FormValidationException(List.of(new FormFieldError("form", "*", "{form.validation.required.form}")));
        }

        validateBase(path, form);

        if (form.getStatus() == null) {
            throw new FormValidationException(List.of(new FormFieldError("form", path + "status", "{form.validation.name}")));
        }
        
        for (int tabIndex = 0; tabIndex < form.getFields().size(); tabIndex++){
            Field tabPage = form.getFields().get(tabIndex);
            validateBase(path + "fields." + tabIndex + ".", tabPage);

            for (int fieldIndex = 0; fieldIndex < tabPage.getFields().size(); fieldIndex++){
                validateRoute(path + "fields." + tabIndex + ".fields." + fieldIndex + ".", tabPage.getFields().get(fieldIndex));
            }
        }
    }

    /**
     * A tab can either contain a formgroup repeating group or a field.
     * @param routeField
     */
    public static void validateRoute(String path, Field routeField) {
        validateBase(path, routeField);
        if (FieldType.FORM_GROUP.equals(routeField.getType())) {
            routeField.getFields().forEach(field -> {
                validateBase(path, field);
                validateField(path, field);
            });
        } else {
            validateField(path, routeField);
        }
    }

    public static void validateBase(String path, Field field) {
        if (field == null) {
            throw new FormValidationException(List.of(new FormFieldError("field", "*", "{form.validation.required.field}")));
        }
        if (field.getName() == null || !field.getName().matches(NAME_REGEX)) {
            throw new FormValidationException(List.of(new FormFieldError("name", path + "name", "{form.validation.name}")));
        }
        if (field.getLabel() == null || !field.getLabel().matches(LABEL_REGEX)) {
            throw new FormValidationException(List.of(new FormFieldError("label", path + "label", "{form.validation.label}")));
        }
        if (field.getClasses() != null && !field.getClasses().isEmpty() && !field.getClasses().matches(CLASSES_REGEX)) {
            throw new FormValidationException(
                    List.of(new FormFieldError("classes", path + "classes", "{form.validation.classes}")));
        }
        if (field.getMetadata() != null) {
            for (String a : field.getMetadata()) {
                if (!a.matches(METADATA_REGEX)) {
                    throw new FormValidationException(
                            List.of(new FormFieldError("metadata", path + "metadata", "{form.validation.metadata}")));
                }
            }
        }
    }
    
    public static void validateField(String path, Field field) {
        if (field == null) {
            throw new FormValidationException(List.of(new FormFieldError("field", "*", "{form.validation.required.field}")));
        }
        if (!field.getName().matches(NAME_REGEX)) {
            throw new FormValidationException(List.of(new FormFieldError("name", path + "name", "{form.validation.name}")));
        }
        if (!field.getLabel().matches(LABEL_REGEX)) {
            
            throw new FormValidationException(List.of(new FormFieldError("label", path + "label", "{form.validation.label}")));
        }
        if (field.getClasses() != null && !field.getClasses().matches(CLASSES_REGEX)) {
            throw new FormValidationException(
                    List.of(new FormFieldError("classes", path + "classes", "{form.validation.classes}")));
        }
        if (field.getMetadata() != null) {
            for (String a : field.getMetadata()) {
                if (!a.matches(METADATA_REGEX)) {
                    throw new FormValidationException(
                            List.of(new FormFieldError("metadata", path + "metadata", "{form.validation.metadata}")));
                }
            }
        }

    }
}
