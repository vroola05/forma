package org.commonground.forma.model.form.idp;

import java.util.UUID;

import org.commonground.forma.model.constants.ProviderType;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class TenantAuthProvider {
    private UUID id;
    private ProviderType providerType;
    private String displayName;
    private String informationText;
    private String linkText;
    private String clientId;
    private String clientSecret;
    private String issuerUri;
    private String scopes;
    private String acrValues;
    private boolean active = true;
}
