package org.commonground.formbuilder.database.dao.submission;

import java.time.OffsetDateTime;
import java.util.UUID;

import org.commonground.formbuilder.database.dao.definition.FormDefinitionEntity;
import org.commonground.formbuilder.model.form.fields.Form;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcType;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.dialect.type.PostgreSQLJsonPGObjectJsonType;
import org.hibernate.type.SqlTypes;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@Entity
@Table(name = "form_submission")
public class FormSubmissionEntity {
    @Id
    private UUID id;

    @Column(nullable = false)
    private UUID tenantId;
    
    @Column(nullable = false, updatable = false)
    @CreationTimestamp
    private OffsetDateTime createdAt;
    @Column(nullable = false)
    private OffsetDateTime modifiedAt;
    
    @Column(nullable = false)
    private String formName;

    @Column(nullable = false)
    private Long formVersion;


    @JdbcTypeCode(SqlTypes.JSON)
    @JdbcType(PostgreSQLJsonPGObjectJsonType.class)
    @Column(columnDefinition = "jsonb")
    private Form data;

    @Column(name = "form_id")
    private UUID formDefinitionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "form_id", insertable = false, updatable = false)
    private FormDefinitionEntity formDefinition;
}
