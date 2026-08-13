package org.commonground.forma.exceptions;

import java.util.List;


public class FormValidationException extends RuntimeException {
    private final List<FormFieldError> errors;

    public FormValidationException(List<FormFieldError> errors) {
        this.errors = errors;
    }

    public List<FormFieldError> getErrors() {
        return errors;
    }
}
