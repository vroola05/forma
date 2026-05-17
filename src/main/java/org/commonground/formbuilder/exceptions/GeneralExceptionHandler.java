package org.commonground.formbuilder.exceptions;

import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;


@RestControllerAdvice
public class GeneralExceptionHandler {
    private final MessageSource messageSource;

    public GeneralExceptionHandler(MessageSource messageSource) {
        this.messageSource = messageSource;
    }

    @ExceptionHandler(FormValidationException.class)
    public ResponseEntity<Map<String, String>> handleFormValidation(FormValidationException ex) {
        Map<String, String> errorMap = new HashMap<>();
        for (FieldError error : ex.getErrors()) {
            errorMap.put(error.getField(), error.getDefaultMessage());
        }
        return ResponseEntity.badRequest().body(errorMap);
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, Object>> handleResponseStatusException(ResponseStatusException ex) {
        String reason = ex.getReason();
        String translatedMessage = reason;

        if (reason != null && reason.startsWith("{") && reason.endsWith("}")) {
            String key = reason.substring(1, reason.length() - 1);
            try {
                translatedMessage = messageSource.getMessage(key, null, LocaleContextHolder.getLocale());
            } catch (Exception e) {
                System.out.println("translatedMessage: "+ e.getMessage());
                e.printStackTrace();
                translatedMessage = key;
            }
        }

        Map<String, Object> body = new LinkedHashMap<>();
        System.out.println("translatedMessage: "+translatedMessage);
        body.put("status", ex.getStatusCode().value());
        body.put("error", ex.getStatusCode().toString());
        body.put("message", translatedMessage);

        return new ResponseEntity<>(body, ex.getStatusCode());
    }

}
