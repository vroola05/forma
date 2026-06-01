package org.commonground.formbuilder.model.settings;

import java.util.List;
import java.util.Set;
import java.util.UUID;

import org.commonground.formbuilder.model.constants.UserStatus;
import org.commonground.formbuilder.util.RegexConstants;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class User {
    private UUID id;

    @NotBlank(message = "{validation.required}")
    @Size(min = 2, max = 100, message = "{validation.name.size}")
    private String name;

    @NotBlank(message = "{validation.required}")
    private String username;

    @NotBlank(message = "{validation.required}")
    @Email(
        regexp = RegexConstants.EMAIL_REGEX, message = "{validation.email}"
    )
    private String email;

    private UserStatus status;

    private Set<Group> groups;
    private Set<String> permissions;
}
