package org.commonground.formbuilder.database.dao.settings;

import java.util.UUID;

import org.commonground.formbuilder.database.dao.BaseEntity;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;


@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "tenant")
public class TenantEntity extends BaseEntity {
    @Id
    private UUID id;
    @Column(nullable = false)
    private String slug;
    @Column(nullable = false)
    private String name;
    @Column(nullable = false)
    private String logoUrl;
    @Column(nullable = false)
    private String homePage;
    @Column(nullable = false)
    private boolean active;
    @Column(nullable = false)
    private String contactEmail;
}
