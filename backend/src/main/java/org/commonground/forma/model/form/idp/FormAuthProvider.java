package org.commonground.forma.model.form.idp;

import java.util.UUID;

import org.commonground.forma.model.constants.ProviderType;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class FormAuthProvider {
    private UUID id;
    private ProviderType providerType;
    private String displayName;
    private String informationText;
    private String linkText;
}
