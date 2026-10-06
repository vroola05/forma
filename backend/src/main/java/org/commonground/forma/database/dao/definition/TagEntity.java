package org.commonground.forma.database.dao.definition;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

import org.commonground.forma.database.dao.BaseEntity;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;


@Entity
@Table(name = "tag")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
public class TagEntity extends BaseEntity {
    @Id
    private UUID id;

    @Column(name = "tenant_id")
    private UUID tenantId;

    @Column(name = "tag_name", nullable = false)
    private String tagName;

    @ManyToMany(mappedBy = "tags")
    private Set<FormVariableEntity> formVariables = new HashSet<>();

}
