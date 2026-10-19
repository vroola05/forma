package org.commonground.forma.database.dao.definition;

import org.commonground.forma.database.dao.BaseEntity;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;


@Entity
@Table(name = "tag")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
public class TagEntity extends BaseEntity {
    @EmbeddedId
    private TagId id;

}
