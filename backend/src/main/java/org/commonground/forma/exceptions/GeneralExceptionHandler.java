package org.commonground.forma.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
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

    private String translate(String input, Object[] args) {
        if (input != null && input.startsWith("{") && input.endsWith("}")) {
            String key = input.substring(1, input.length() - 1);
            try {
                return messageSource.getMessage(key, args, LocaleContextHolder.getLocale());
            } catch (Exception e) {
                return key;
            }
        }
        return input;
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ApiErrorResponse> handleResponseStatusException(ResponseStatusException ex) {
        return new ResponseEntity<>(new ApiErrorResponse(
                ex.getStatusCode().value(),
                ex.getStatusCode().toString(),
                ApiErrorType.CONSOLE,
                translate(ex.getReason(), null)), 
            ex.getStatusCode());
    }

    @ExceptionHandler(FormValidationException.class)
    public ResponseEntity<ApiErrorResponse> handleFormValidation(FormValidationException ex) {
        ValidationTree validationTree = new ValidationTree();
        for (FormFieldError error : ex.getErrors()) {
            validationTree.addError(error.getField(), translate(error.getDefaultMessage(), error.getArgs()));
        }

        return ResponseEntity.unprocessableContent().body(new ApiErrorResponse(
                HttpStatus.UNPROCESSABLE_CONTENT.value(),
                HttpStatus.UNPROCESSABLE_CONTENT.toString(), translate(ex.getMessage(), null),
                validationTree.build()
            ));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponse> handleValidationException(MethodArgumentNotValidException ex) {
        ValidationTree validationTree = new ValidationTree();
        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            validationTree.addError(error.getField(), translate(error.getDefaultMessage(), null));
        }

        return ResponseEntity.unprocessableContent().body(new ApiErrorResponse(
                HttpStatus.UNPROCESSABLE_CONTENT.value(),
                HttpStatus.UNPROCESSABLE_CONTENT.toString(), translate(ex.getMessage(), null),
                validationTree.build()
            ));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiErrorResponse> handleHttpMessageNotReadableException(HttpMessageNotReadableException ex) {
        
        return ResponseEntity.badRequest().body(new ApiErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                HttpStatus.BAD_REQUEST.toString(),
                ApiErrorType.CONSOLE,
                translate(ex.getMessage(), null)));
    }
    

}
