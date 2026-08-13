package org.commonground.forma.model.settings;

import org.commonground.forma.validator.ValidPassword;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserRegisterRequest extends User {
    @ValidPassword
    private String password;
}
