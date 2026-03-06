package org.commonground.formbuilder.database.dao.definition;

import java.util.List;
import java.util.UUID;

import org.commonground.formbuilder.model.form.condition.Condition;
import org.hibernate.annotations.JdbcType;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.dialect.type.PostgreSQLJsonPGObjectJsonType;
import org.hibernate.type.SqlTypes;
import org.springframework.data.domain.Persistable;

import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PostLoad;
import jakarta.persistence.PostPersist;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import jakarta.persistence.Version;


@Data
@NoArgsConstructor
@Entity
@Table(name = "form_tab_definition")
public class FormTabDefinitionEntity {
    @Id
    private UUID id;
    @Column(nullable = false)
    private String name;
    private String label;
    private String classes;
    
    @Column(nullable = false)
    private boolean sharedTab;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "metadata", columnDefinition = "text[]")
    private List<String> metadata;

    @JdbcTypeCode(SqlTypes.JSON)
    @JdbcType(PostgreSQLJsonPGObjectJsonType.class)
    @Column(columnDefinition = "jsonb")
    private Condition condition;

    @Column(nullable = false)
    private boolean show;

    @Version
    @Column(nullable = false)
    private Long version;

}
