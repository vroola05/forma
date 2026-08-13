package org.commonground.forma.exceptions;

public class FieldValidationException extends Exception {
    private final Object[] args;

    public FieldValidationException(String message) {
        super(message);
        this.args = null;
    }

    public FieldValidationException(String message, Object... args) {
        super(message);
        this.args = args;
    }

    public Object[] getArgs() {
        return args;
    }
}
