package org.commonground.formbuilder.database.dao.definition;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.commonground.formbuilder.model.form.condition.Condition;
import org.hibernate.annotations.JdbcType;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.dialect.type.PostgreSQLJsonPGObjectJsonType;
import org.hibernate.type.SqlTypes;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.Version;


@Data
@NoArgsConstructor
@Entity
@Table(name = "form_definition")
public class FormDefinitionEntity {
    @Id
    private UUID id;
    @Column(nullable = false)
    private String name;
    private String label;
    private String classes;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "metadata", columnDefinition = "text[]")
    private List<String> metadata;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "summary_confirmation", columnDefinition = "text[]")
    private List<String> summaryConfirmation;

    @JdbcTypeCode(SqlTypes.JSON)
    @JdbcType(PostgreSQLJsonPGObjectJsonType.class)
    @Column(columnDefinition = "jsonb")
    private Condition condition;
    private boolean show;

    @Version
    @Column(nullable = false)
    private Long version;

    @OneToMany(mappedBy = "form", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<FormTabInstanceDefinitionEntity> tabs = new ArrayList<>();


    public List<String> getMetadata() {
        return metadata == null ? null : metadata;
    }

    public List<String> getSummaryConfirmation() {
        return summaryConfirmation == null ? null : summaryConfirmation;
    }
}
