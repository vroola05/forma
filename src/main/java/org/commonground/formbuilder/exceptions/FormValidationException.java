package org.commonground.formbuilder.exceptions;

import java.util.List;

import org.springframework.validation.FieldError;


public class FormValidationException extends RuntimeException {
    private final List<FieldError> errors;

    public FormValidationException(List<FieldError> errors) {
        this.errors = errors;
    }

    public List<FieldError> getErrors() {
        return errors;
    }
}
