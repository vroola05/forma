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
import org.commonground.formbuilder.model.form.condition.Condition;
import org.commonground.formbuilder.util.condition.ConditionParser;
import org.springframework.validation.FieldError;

public class FormValidator {
    

    public static void validate(Form form, Form definition) {
        if (form.getName() == null && !form.getName().equals(definition.getName())) {
            throw new FormValidationException(List.of(
                        new FieldError(form.getName(), form.getName(),
                                String.format("Het form {} is niet gevonden", form.getLabel()))));
        }

        validateTabPages(definition, form);
    }

    private static void validateTabPages(Form definition, Form form) {
        for (Field tabPageDef : definition.getFields()) {
            Optional<TabPage> tabPageOptional = form.getTab(tabPageDef.getName());
            if (tabPageOptional.isEmpty()) {
                throw new FormValidationException(List.of(
                        new FieldError(form.getName(), tabPageDef.getName(),
                                String.format("Het tabblad {} is niet gevonden", tabPageDef.getLabel()))));
            }

            Field tabPage = tabPageOptional.get();
            tabPage.setShow(checkShowConditions(form, tabPageDef.getCondition()));
            if (tabPage.isShow()) {
                validateFormGroups(form, tabPage, tabPageDef);
            }
        }
    }

    private static void validateFormGroups(Form form, Field tabPage, Field tabPageDefinition) {
        // for (Field formGroupDef : tabPageDefinition.getFields()) {
        //     Optional<Field> formGroupOptional = tabPage.getFields(formGroupDef.getName());
        //     if (formGroupOptional.isEmpty()) {
        //         throw new FormValidationException(List.of(
        //                 new FieldError(tabPage.getName(), formGroupDef.getName(),
        //                         String.format("De set {} is niet gevonden", formGroupDef.getLabel()))));
        //     }

        //     FormGroup formGroup = formGroupOptional.get();
        //     formGroup.setShow(checkShowConditions(form, formGroupDef.getCondition()));
        //     if (formGroup.isShow()) {
        //         validateFields(form, formGroup, formGroupDef);
        //     }
        // }
    }

    private static void validateFields(Form form, FormGroup formGroup, FormGroup formGroupDefinition) {
        List<FieldError> fieldErrors = new ArrayList<>();

        for (Field fieldDef : formGroupDefinition.getFields()) {
            Optional<Field> fieldOptional = formGroup.getField(fieldDef.getName());
            if (fieldOptional.isEmpty()) {
                throw new FormValidationException(List.of(
                        new FieldError(formGroup.getName(), fieldDef.getName(),
                                String.format("Het veld {} is niet gevonden", formGroup.getName()))));
            }

            Field field = fieldOptional.get();
            field.setShow(checkShowConditions(form, fieldDef.getCondition()));
            if (field.isShow()) {
                try {
                    validateField(field, fieldDef);
                } catch (FieldValidationException e) {
                    fieldErrors.add(new FieldError(formGroup.getName(), fieldDef.getName(), e.getMessage()));
                }
            }
        }

        if (!fieldErrors.isEmpty()) {
            throw new FormValidationException(fieldErrors);
        }
    }

    private static void validateField(Field fieldDefinition, Field field) throws FieldValidationException {
        if (FieldType.REPEATING_GROUP.equals(field.getType())) {

        } else if (FieldType.TEXT.equals(field.getType())) {
            fieldDefinition.validate(field.getValue());
        } else if (FieldType.SELECT.equals(field.getType())) {
            fieldDefinition.validate(field.getValue());
        } else if (FieldType.RADIO.equals(field.getType())) {
            fieldDefinition.validate(field.getValue());
        } else if (FieldType.CHECKBOX.equals(field.getType())) {
            fieldDefinition.validate(field.getValue());
        }


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
