package org.commonground.forma.database.dao.settings;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

import org.commonground.forma.database.dao.BaseEntity;
import org.commonground.forma.model.constants.ProviderType;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "tenant_auth_providers")
public class TenantAuthProviderEntity extends BaseEntity {
    @Id
    private UUID id;

    @Column(nullable = false)
    private UUID tenantId;

    @Enumerated(EnumType.STRING)
    @Column(name = "provider_type", nullable = false)
    private ProviderType providerType;

    @Column(name = "display_name", nullable = false)
    private String displayName;

    @Column(name = "information_text")
    private String informationText;

    @Column(name = "link_text")
    private String linkText;

    @Column(name = "client_id", nullable = false)
    private String clientId;

    @Column(name = "client_secret", nullable = false)
    private String clientSecret;

    @Column(name = "issuer_uri", nullable = false)
    private String issuerUri;

    @Column(nullable = false)
    private String scopes = "openid,profile,email";

    @Column(name = "acr_values")
    private String acrValues;

    @Column(nullable = false)
    private boolean active = true;

    @OneToMany(mappedBy = "authProvider", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<TenantAuthProviderGroupEntity> groupMapping = new HashSet<>();

    public void addGroupMapping(GroupEntity group, String externalId, String externalName) {
        TenantAuthProviderGroupEntity tenantAuthProviderGroupEntity = new TenantAuthProviderGroupEntity(
                this,
                group,
                externalId,
                externalName);
        this.groupMapping.add(tenantAuthProviderGroupEntity);
    }

    public void retainGroups(Set<UUID> groupIdsNotToRemove) {
        if (groupIdsNotToRemove == null) {
            return;
        }

        this.groupMapping.removeIf(g -> !groupIdsNotToRemove.contains(g.getId().getGroupId()));
    }

    public void removeGroupMapping(TenantAuthProviderGroupEntity tenantAuthProviderGroupEntity) {
        this.groupMapping.remove(tenantAuthProviderGroupEntity);
        tenantAuthProviderGroupEntity.setAuthProvider(null);
    }
}
