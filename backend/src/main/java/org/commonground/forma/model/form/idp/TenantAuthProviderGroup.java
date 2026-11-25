package org.commonground.forma.model.form.idp;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TenantAuthProviderGroup {
    private String externalId;
    private String externalName;
    private UUID groupId;
}
