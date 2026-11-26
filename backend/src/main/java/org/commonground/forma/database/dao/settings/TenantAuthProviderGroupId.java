package org.commonground.forma.database.dao.settings;

import java.io.Serializable;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class TenantAuthProviderGroupId implements Serializable {

    @Column(name = "auth_provider_id", nullable = false)
    private UUID authProviderId;

    @Column(name = "group_id", nullable = false)
    private UUID groupId;
}
