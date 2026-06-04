package org.commonground.formbuilder.model.settings;

import org.commonground.formbuilder.validator.ValidPassword;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserRegisterRequest extends User {
    @ValidPassword
    private String password;
}
