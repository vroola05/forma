package org.commonground.forma.database.dao.settings;

import java.util.UUID;

import org.commonground.forma.database.dao.BaseEntity;
import org.commonground.forma.model.constants.TenantStatus;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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
    private String logo;
    @Column(nullable = false)
    private String homePage;
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private TenantStatus status;
    @Column(nullable = false)
    private String email;
    @Column
    private String primaryColor;
    @Column
    private String secondaryColor;
}
