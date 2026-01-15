package org.commonground.formbuilder;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.commonground.formbuilder.exceptions.FieldValidationException;
import org.commonground.formbuilder.exceptions.FormValidationException;
import org.commonground.formbuilder.model.form.Field;
import org.commonground.formbuilder.model.form.FieldType;
import org.commonground.formbuilder.model.form.Form;
import org.commonground.formbuilder.model.form.FormGroup;

import org.commonground.formbuilder.model.form.TabPage;
import org.commonground.formbuilder.model.form.TextField;
import org.springframework.validation.FieldError;

public class FormValidator {
    

    public static void validate(Form definition, Form form) {
        if (form.getName() == null && !form.getName().equals(definition.getName())) {
            throw new FormValidationException(List.of(
                        new FieldError(form.getName(), form.getName(),
                                String.format("Het form {} is niet gevonden", form.getLabel()))));
        }

        validateTabPages(definition, form);
    }

    private static void validateTabPages(Form definition, Form form) {
        for (TabPage tabPage : form.getTabs()) {
            Optional<TabPage> tabPageDefinitionOptional = definition.getTab(tabPage.getName());
            if (tabPageDefinitionOptional.isEmpty()) {
                throw new FormValidationException(List.of(
                        new FieldError(form.getName(), tabPage.getName(),
                                String.format("Het tabblad {} is niet gevonden", tabPage.getLabel()))));

            }

            TabPage tabPageDefinition = tabPageDefinitionOptional.get();
            validateFormGroups(tabPageDefinition, tabPage);

        }
    }

    private static void validateFormGroups(TabPage tabPageDefinition, TabPage tabPage) {
        for (FormGroup formGroup : tabPage.getFormGroups()) {
            Optional<FormGroup> formGroupDefinitionOptional = tabPageDefinition.getFormGroup(formGroup.getName());
            if (formGroupDefinitionOptional.isEmpty()) {
                throw new FormValidationException(List.of(
                        new FieldError(tabPage.getName(), formGroup.getName(),
                                String.format("De set {} is niet gevonden", formGroup.getLabel()))));
            }

            FormGroup formGroupDefinition = formGroupDefinitionOptional.get();
            validateFields(formGroupDefinition, formGroup);
        }
    }

    private static void validateFields(FormGroup formGroupDefinition, FormGroup formGroup) {
        List<FieldError> fieldErrors = new ArrayList<>();

        for (Field field : formGroup.getFields()) {
            Optional<Field> fieldDefinitionOptional = formGroupDefinition.getField(field.getName());
            if (fieldDefinitionOptional.isEmpty()) {
                throw new FormValidationException(List.of(
                        new FieldError(formGroup.getName(), field.getName(),
                                String.format("Het veld {} is niet gevonden", formGroup.getName()))));
            }

            Field fieldDefinition = fieldDefinitionOptional.get();
            
            try {
                validateField(fieldDefinition, field);
            } catch (FieldValidationException e) {
                fieldErrors.add(new FieldError(formGroup.getName(), field.getName(), e.getMessage()));
            }
        }

        if (!fieldErrors.isEmpty()) {
            throw new FormValidationException(fieldErrors);
        }
    }

    private static void validateField(Field fieldDefinition, Field field) throws FieldValidationException {
            if (FieldType.REPEATING_GROUP.equals(field.getType())) {

            } else if (FieldType.TEXT.equals(field.getType())) {
                validateTextField((TextField)fieldDefinition, field.getValue());
            }

    }

    private static void validateTextField(TextField definition, String value) throws FieldValidationException {
        if (value == null) {
            value = "";
        }

        if (definition.getRequired() != null && definition.getRequired() && value.isEmpty()) {
            throw new FieldValidationException(String.format("Het veld {} is verplicht", definition.getLabel()));
        }

        if (definition.getMinlength() != null && definition.getMinlength() > 0 && value.length() < definition.getMinlength()) {
            throw new FieldValidationException(String.format("Het minimum aantal tekens voor {} is {}", definition.getLabel(), definition.getMinlength()));
        }

        if (definition.getMaxlength() != null && definition.getMaxlength() < 0 && value.length() > definition.getMaxlength()) {
            throw new FieldValidationException(String.format("Het maximum aantal tekens voor {} is {}", definition.getLabel(), definition.getMaxlength()));
        }
    }
}
