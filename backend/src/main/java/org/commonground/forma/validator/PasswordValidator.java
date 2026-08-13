package org.commonground.forma.validator;

import java.util.ArrayList;
import java.util.List;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class PasswordValidator implements ConstraintValidator<ValidPassword, String> {

    @Override
    public boolean isValid(String password, ConstraintValidatorContext context) {
        if (password == null || password.isEmpty()) {
            return true;
        }

        List<String> errors = new ArrayList<>();
        
        if (password.length() < 12) {
            errors.add("{validation.password.size}");
        }

        boolean hasCapital = false;
        boolean hasNumber = false;

        for (char c : password.toCharArray()) {
            if (Character.isUpperCase(c)) hasCapital = true;
            if (Character.isDigit(c)) hasNumber = true;
        }

        if (!hasCapital) {
            errors.add("{validation.password.uppercase}");
        }
        if (!hasNumber) {
            errors.add("{validation.password.number}");
        }

        if (errors.isEmpty()) {
            return true;
        }

        context.disableDefaultConstraintViolation();

        for (String error : errors) {
            context.buildConstraintViolationWithTemplate(error)
                   .addConstraintViolation();
        }

        return false;
    }
}