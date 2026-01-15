package org.commonground.formbuilder.exceptions;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;


@RestControllerAdvice
public class GeneralExceptionHandler {

    @ExceptionHandler(FormValidationException.class)
    public ResponseEntity<Map<String, String>> handleFormValidation(FormValidationException ex) {
        Map<String, String> errorMap = new HashMap<>();
        for (FieldError error : ex.getErrors()) {
            errorMap.put(error.getField(), error.getDefaultMessage());
        }
        return ResponseEntity.badRequest().body(errorMap);
    }

}
