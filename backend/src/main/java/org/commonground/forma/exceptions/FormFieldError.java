package org.commonground.forma.exceptions;

import org.springframework.validation.FieldError;

public class FormFieldError extends FieldError {
    private final Object[] args;

    public FormFieldError(String objectName, String field, String defaultMessage) {
        super(objectName, field, defaultMessage);
        this.args = null;
    }

    public FormFieldError(String objectName, String field, String defaultMessage, Object... args) {
        super(objectName, field, defaultMessage);
        this.args = args;
    }

    public Object[] getArgs() {
        return args;
    }
}
