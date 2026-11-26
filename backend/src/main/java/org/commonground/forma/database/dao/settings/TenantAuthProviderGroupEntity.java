package org.commonground.forma.database.dao.settings;

import java.time.OffsetDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "tenant_auth_provider_groups")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TenantAuthProviderGroupEntity {

    @EmbeddedId
    private TenantAuthProviderGroupId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("authProviderId")
    @JoinColumn(name = "auth_provider_id", nullable = false)
    private TenantAuthProviderEntity authProvider;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("groupId")
    @JoinColumn(name = "group_id", nullable = false)
    private GroupEntity group;

    @Column(name = "external_id", nullable = false)
    private String externalId;

    @Column(name = "external_name")
    private String externalName;


    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    @Version
    @Column(name = "version", nullable = false)
    private Long version;

    public TenantAuthProviderGroupEntity(TenantAuthProviderEntity authProvider, GroupEntity group, String externalId, String externalName) {
        this.id = new TenantAuthProviderGroupId(authProvider.getId(), group.getId());
        this.authProvider = authProvider;
        this.group = group;
        this.externalId = externalId;
        this.externalName = externalName;
    }
}
