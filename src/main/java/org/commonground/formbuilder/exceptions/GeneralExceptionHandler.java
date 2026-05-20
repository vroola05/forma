package org.commonground.formbuilder.exceptions;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

@RestControllerAdvice
public class GeneralExceptionHandler {
    private final MessageSource messageSource;

    public GeneralExceptionHandler(MessageSource messageSource) {
        this.messageSource = messageSource;
    }

    private String translate(String input) {
        if (input != null && input.startsWith("{") && input.endsWith("}")) {
            String key = input.substring(1, input.length() - 1);
            try {
                return messageSource.getMessage(key, null, LocaleContextHolder.getLocale());
            } catch (Exception e) {
                return key;
            }
        }
        return input;
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, Object>> handleResponseStatusException(ResponseStatusException ex) {
        Map<String, Object> body = new LinkedHashMap<>();

        body.put("status", ex.getStatusCode().value());
        body.put("error", ex.getStatusCode().toString());
        body.put("message", translate(ex.getReason()));

        return new ResponseEntity<>(body, ex.getStatusCode());
    }

    @ExceptionHandler(FormValidationException.class)
    public ResponseEntity<Map<String, Object>> handleFormValidation(FormValidationException ex) {
        Map<String, Object> body = new LinkedHashMap<>();

        for (FieldError error : ex.getErrors()) {
            addToTree(body, error.getField(), error.getDefaultMessage());
        }

        return ResponseEntity.badRequest().body(body);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationException(MethodArgumentNotValidException ex) {
        Map<String, Object> body = new LinkedHashMap<>();

        ex.getBindingResult().getFieldErrors().forEach(error -> {
            addToTree(body, error.getField(), error.getDefaultMessage());
        });

        return new ResponseEntity<>(body, ex.getStatusCode());
    }

    private void addToTree(Map<String, Object> tree, String currentPath, String message) {
        String[] pathList = currentPath.split("\\.");
        Map<String, Object> currentMap = tree;

        for (int i = 0; i < pathList.length - 1; i++) {
            String path = pathList[i];
            currentMap.computeIfAbsent(path, k -> new LinkedHashMap<String, Object>());
            currentMap = (Map<String, Object>) currentMap.get(path);
        }

        String lastPath = pathList[pathList.length - 1];

        currentMap.computeIfAbsent(lastPath, k -> new ArrayList<String>());

        List<String> errorList = (List<String>) currentMap.get(lastPath);
        errorList.add(translate(message));
    }

    // @ExceptionHandler(FormValidationException.class)
    // public ResponseEntity<Map<String, String>>
    // handleFormValidation(FormValidationException ex) {
    // Map<String, String> errorMap = new HashMap<>();
    // for (FieldError error : ex.getErrors()) {
    // errorMap.put(error.getField(), error.getDefaultMessage());
    // }
    // return ResponseEntity.badRequest().body(errorMap);
    // }

    // @ExceptionHandler(MethodArgumentNotValidException.class)
    // public ResponseEntity<Map<String, Object>>
    // handleValidationException(MethodArgumentNotValidException ex) {
    // Map<String, Object> body = new LinkedHashMap<>();

    // ex.getBindingResult().getFieldErrors().forEach(error -> {
    // String fieldPath = error.getField();

    // String[] pathList = fieldPath.split("\\.");
    // Map<String, Object> currentMap = body;

    // for (int i = 0; i < pathList.length - 1; i++) {
    // String path = pathList[i];
    // currentMap.computeIfAbsent(path, k -> new LinkedHashMap<String, Object>());
    // currentMap = (Map<String, Object>) currentMap.get(path);
    // }

    // String lastPath = pathList[pathList.length - 1];

    // currentMap.computeIfAbsent(lastPath, k -> new ArrayList<String>());

    // List<String> errorList = (List<String>) currentMap.get(lastPath);
    // errorList.add(translate(error.getDefaultMessage()));
    // });

    // return new ResponseEntity<>(body, ex.getStatusCode());
    // }

}
