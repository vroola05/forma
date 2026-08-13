package org.commonground.forma.database.dao.submission;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.commonground.forma.database.dao.BaseEntity;
import org.commonground.forma.database.dao.definition.FormDefinitionEntity;
import org.commonground.forma.database.dao.definition.FormTabInstanceDefinitionEntity;
import org.commonground.forma.model.form.fields.Form;
import org.hibernate.annotations.JdbcType;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.dialect.type.PostgreSQLJsonPGObjectJsonType;
import org.hibernate.type.SqlTypes;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "form_submission")
public class FormSubmissionEntity extends BaseEntity {
    @Id
    private UUID id;

    @Column(nullable = false)
    private UUID tenantId;
    
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

    @OneToMany(mappedBy = "formSubmission", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<FormSubmissionFileEntity> formFiles = new ArrayList<>();
}
