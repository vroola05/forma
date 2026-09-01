package org.commonground.forma.database.dao.definition;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.commonground.forma.database.dao.BaseEntity;
import org.commonground.forma.database.dao.translation.TabTranslationEntity;
import org.commonground.forma.model.form.condition.Condition;
import org.hibernate.annotations.JdbcType;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.dialect.type.PostgreSQLJsonPGObjectJsonType;
import org.hibernate.type.SqlTypes;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "form_tab_definition")
public class FormTabDefinitionEntity extends BaseEntity {
    @Id
    private UUID id;
    
    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(nullable = false)
    private String name;
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

    @OneToMany(mappedBy = "tab", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TabTranslationEntity> labels = new ArrayList<>();

    @OneToMany(mappedBy = "tab", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<FormFieldDefinitionEntity> fields = new ArrayList<>();
}
