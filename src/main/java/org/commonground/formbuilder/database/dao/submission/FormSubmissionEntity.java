package org.commonground.formbuilder.database.dao.submission;

import java.sql.Timestamp;
import java.time.OffsetDateTime;
import java.util.UUID;

import org.commonground.formbuilder.model.form.Form;
import org.hibernate.annotations.JdbcType;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.dialect.type.PostgreSQLJsonPGObjectJsonType;
import org.hibernate.type.SqlTypes;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
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
    private OffsetDateTime createdAt;
    @Column(nullable = false)
    private OffsetDateTime modifiedAt;
    
    @Column(nullable = false)
    private UUID formId;
    @Column(nullable = false)
    private String formName;

    @Version
    @Column(nullable = false)
    private Long formVersion;


    @JdbcTypeCode(SqlTypes.JSON)
    @JdbcType(PostgreSQLJsonPGObjectJsonType.class)
    @Column(columnDefinition = "jsonb")
    private Form data;

}
