package org.commonground.formbuilder.database.dao.settings;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

import org.commonground.formbuilder.database.dao.BaseEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "groups")
public class GroupEntity extends BaseEntity {
    @Id
    private UUID id;
    @Column(nullable = false)
    private UUID tenantId;

    @Column(nullable = false)
    private String name;

    @ManyToMany(mappedBy = "groups")
    private Set<TenantUserEntity> users = new HashSet<>();

    @ManyToMany
    @JoinTable(
        name = "group_permissions",
        joinColumns = @JoinColumn(name = "group_id"),
        inverseJoinColumns = @JoinColumn(name = "permission_id"))
    private Set<PermissionEntity> permissions = new HashSet<>();
}
