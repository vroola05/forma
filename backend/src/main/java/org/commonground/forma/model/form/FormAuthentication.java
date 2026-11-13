package org.commonground.forma.model.form;

import java.util.List;
import java.util.UUID;

public record FormAuthentication(
    UUID formId,
    List<Translation> label,
    String description,
    boolean publicAccess,
    boolean allowFormLogin,
    List<ExternalIdp> externalProviders
) {
    
    public record ExternalIdp(
        UUID id,
        String providerType, 
        String displayName,  
        String loginUrl
    ) {}
}