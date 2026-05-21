package org.commonground.formbuilder.model.settings;

import java.util.UUID;

import org.commonground.formbuilder.util.RegexConstants;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class Tenant {
    private UUID id;

    @NotBlank(message = "{validation.required}")
    @Size(min = 2, max = 100, message = "{validation.name.size}")
    private String name;

    @NotBlank(message = "{validation.required}")
    @Pattern(
        regexp = RegexConstants.SLUG_REGEX,
        message = "{validation.slug}"
    )
    private String slug;
    private String homePage;

    private boolean active;

    @Email(
        regexp = RegexConstants.EMAIL_REGEX, message = "{validation.email}"
    )
    private String email;

    @Valid
    private User tenantAdmin;

}
