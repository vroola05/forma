package org.commonground.forma.model.form.idp;

import java.util.List;
import java.util.Set;
import java.util.UUID;

import org.commonground.forma.model.form.Translation;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class FormAuthentication {
    private UUID formId;
    private List<Translation> label;
    private String description;
    private boolean publicAccess;
    private boolean allowFormLogin;
    private Set<FormAuthProvider> formAuthProvider;
}