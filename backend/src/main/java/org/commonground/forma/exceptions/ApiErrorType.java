package org.commonground.forma.exceptions;

import com.fasterxml.jackson.annotation.JsonCreator;
import java.util.stream.Stream;


public enum ApiErrorType {
    TOAST,
    CONSOLE,
    VALIDATION,
    DIALOG;

    @JsonCreator
    public static ApiErrorType fromString(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        
        return Stream.of(ApiErrorType.values())
                .filter(error -> error.name().equalsIgnoreCase(value.trim()))
                .findFirst()
                .orElse(null);
    }
}
