package org.commonground.forma.database.dao.definition;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.commonground.forma.database.dao.BaseEntity;
import org.commonground.forma.database.dao.translation.FormTranslationEntity;
import org.commonground.forma.model.constants.FormStatus;
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
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;


@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "form_definition")
public class FormDefinitionEntity extends BaseEntity {
    @Id
    private UUID id;
    @Column(nullable = false)
    private String name;
    private String label;
    private String classes;

    @Column(nullable = false)
    private UUID tenantId;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "metadata", columnDefinition = "text[]")
    private List<String> metadata;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "summary_confirmation", columnDefinition = "text[]")
    private List<String> confirmation;

    @JdbcTypeCode(SqlTypes.JSON)
    @JdbcType(PostgreSQLJsonPGObjectJsonType.class)
    @Column(columnDefinition = "jsonb")
    private Condition condition;
    private boolean show;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private FormStatus status;

    @OneToMany(mappedBy = "form", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<FormTranslationEntity> labels = new ArrayList<>();

    @OneToMany(mappedBy = "form", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<FormTabInstanceDefinitionEntity> tabs = new ArrayList<>();

    @OneToOne(mappedBy = "form", cascade = CascadeType.ALL, orphanRemoval = true)
    private FormConfigSuccessPageEntity formConfigSuccessPageEntity;


    public List<String> getMetadata() {
        return metadata == null ? null : metadata;
    }

    public List<String> getConfirmation() {
        return confirmation == null ? null : confirmation;
    }
}
