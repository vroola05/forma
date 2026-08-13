package org.commonground.forma.exceptions;

import java.time.Instant;
import java.util.Map;

public record ApiErrorResponse(
    int status,
    String error,
    ApiErrorType type,
    String message,
    Instant timestamp,
    Map<String, Object> details
) {
    public ApiErrorResponse(int status, String error, ApiErrorType type, String message) {
        this(status, error, type, message, Instant.now(), null);
    }

    public ApiErrorResponse(int status, String error, String message, Map<String, Object> details) {
        this(status, error, ApiErrorType.VALIDATION, message, Instant.now(), details);
    }
}
