package org.commonground.formbuilder.database.dao.definition;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.commonground.formbuilder.model.form.Option;
import org.commonground.formbuilder.model.form.condition.Condition;
import org.hibernate.annotations.JdbcType;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.dialect.type.PostgreSQLJsonPGObjectJsonType;
import org.hibernate.type.SqlTypes;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@Entity
@Table(name = "form_field_definition")
public class FormFieldDefinitionEntity {
    @Id
    private UUID id;

    @Column(nullable = false)
    private String name;
    private String label;
    @Column(nullable = false)
    private String type;
    private String classes;

    
    private String placeholder;
    private Boolean readonly;
    private Boolean required;
    private Integer minLength;
    private Integer maxLength;
    private String value;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "metadata", columnDefinition = "text[]")
    private List<String> metadata;

    @JdbcTypeCode(SqlTypes.JSON)
    @JdbcType(PostgreSQLJsonPGObjectJsonType.class)
    @Column(columnDefinition = "jsonb")
    private Condition condition;

    @Column(nullable = false)
    private Boolean show;

    @Column(nullable = false)
    private int sortOrder;

    @JdbcTypeCode(SqlTypes.JSON)
    @JdbcType(PostgreSQLJsonPGObjectJsonType.class)
    @Column(columnDefinition = "jsonb")
    private List<Option> values;

    @JdbcTypeCode(SqlTypes.JSON)
    @JdbcType(PostgreSQLJsonPGObjectJsonType.class)
    @Column(columnDefinition = "jsonb")
    private List<Option> options;

    @ManyToOne
    @JoinColumn(name = "tab_id")
    private FormTabDefinitionEntity tab;

    @ManyToOne
    @JoinColumn(name = "parent_field_id")
    private FormFieldDefinitionEntity parent;

    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sortOrder ASC")
    private List<FormFieldDefinitionEntity> children = new ArrayList<>();

    public List<String> getMetadata() {
        return metadata == null ? null : metadata;
    }

    public List<Option> getValues() {
        return values == null ? null : values;
    }

    public List<Option> getOptions() {
        return options == null ? null : options;
    }
}
