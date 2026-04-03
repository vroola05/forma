package org.commonground.formbuilder;

import java.util.List;

import org.commonground.formbuilder.exceptions.FormValidationException;
import org.commonground.formbuilder.model.FormWrapper;
import org.commonground.formbuilder.model.form.Field;
import org.commonground.formbuilder.model.form.FieldType;
import org.commonground.formbuilder.model.form.Form;
import org.springframework.validation.FieldError;

public class FormBuilderValidator {

    private static final String NAME_REGEX = "^(?=.{1,200}$)[a-z](?:[a-z0-9_-]*[a-z0-9])?$";
    private static final String LABEL_REGEX = ".{0,200}$";
    private static final String CLASSES_REGEX = "(?i)^(?:(?=.{1,200}$)[a-z][a-z0-9_-]*(?:\\s+[a-z][a-z0-9_-]*)*)?$";
    private static final String METADATA_REGEX = ".{0,10}$";

    public static void validate(FormWrapper formWrapper) {
        if (formWrapper.getFileName() != null) {

            if (!formWrapper.getFileName().matches("^[0-9a-zA-Z_\\-]+\\.json$")) {
                throw new FormValidationException(
                        List.of(new FieldError("fileName", "fileName", "De bestandsnaam is niet geldig.")));
            }
        }

        if (formWrapper.getForm() == null) {
            throw new FormValidationException(List.of(new FieldError("form", "form", "Het formulier is verplicht.")));
        }

        validate(formWrapper.getForm());

    }

    public static void validate(Form form) {
        if (form == null) {
            throw new FormValidationException(List.of(new FieldError("form", "form", "Het formulier is verplicht.")));
        }

        validateBase(form);

        form.getFields().forEach(tabPage -> {
            validateBase(tabPage);
            tabPage.getFields().forEach(field -> {
                validateRoute(field);
            });
        });
    }

    /**
     * A tab can either contain a formgroup repeating group or a field.
     * @param routeField
     */
    public static void validateRoute(Field routeField) {
        validateBase(routeField);
        if (FieldType.FORM_GROUP.equals(routeField.getType())) {
            routeField.getFields().forEach(field -> {
                validateBase(field);
                validateField(field);
            });
        } else {
            validateField(routeField);
        }
    }

    public static void validateBase(Field field) {
        if (field == null) {
            throw new FormValidationException(List.of(new FieldError("field", "field", "Het veld is verplicht.")));
        }
        if (field.getName() == null || !field.getName().matches(NAME_REGEX)) {
            throw new FormValidationException(List.of(new FieldError("name", "name", "De naam is niet geldig.")));
        }
        if (field.getLabel() == null || !field.getLabel().matches(LABEL_REGEX)) {
            throw new FormValidationException(List.of(new FieldError("label", "label", "Het label is niet geldig.")));
        }
        if (field.getClasses() != null && !field.getClasses().isEmpty() && !field.getClasses().matches(CLASSES_REGEX)) {
            throw new FormValidationException(
                    List.of(new FieldError("classes", "classes", "De classes zijn niet geldig.")));
        }
        if (field.getMetadata() != null) {
            for (String a : field.getMetadata()) {
                if (!a.matches(METADATA_REGEX)) {
                    throw new FormValidationException(
                            List.of(new FieldError("metadata", "metadata", "De metadata is niet geldig.")));
                }
            }
        }
    }
    
    public static void validateField(Field field) {
        if (field == null) {
            throw new FormValidationException(List.of(new FieldError("field", "field", "Het veld is verplicht.")));
        }
        if (!field.getName().matches(NAME_REGEX)) {
            throw new FormValidationException(List.of(new FieldError("name", "name", "De naam is niet geldig.")));
        }
        System.out.println(field.getName());
        if (!field.getLabel().matches(LABEL_REGEX)) {
            
            throw new FormValidationException(List.of(new FieldError("label", "label", "Het label is niet geldig.")));
        }
        if (field.getClasses() != null && !field.getClasses().matches(CLASSES_REGEX)) {
            throw new FormValidationException(
                    List.of(new FieldError("classes", "classes", "De classes zijn niet geldig.")));
        }
        if (field.getMetadata() != null) {
            for (String a : field.getMetadata()) {
                if (!a.matches(METADATA_REGEX)) {
                    throw new FormValidationException(
                            List.of(new FieldError("metadata", "metadata", "De metadata is niet geldig.")));
                }
            }
        }

    }
}
