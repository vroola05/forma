package org.commonground.forma.database.dao.definition;

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
public class TagId implements Serializable {

    @Column(name = "tenant_id")
    private UUID tenantId;

    @Column(name = "tag_name")
    private String tagName;
}