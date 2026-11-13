package org.commonground.forma.database.dao.definition;

import java.util.UUID;

import org.commonground.forma.database.dao.BaseEntity;
import org.commonground.forma.model.form.condition.Condition;
import org.hibernate.annotations.JdbcType;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.dialect.type.PostgreSQLJsonPGObjectJsonType;
import org.hibernate.type.SqlTypes;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "form_variable_values")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
public class FormVariableValueEntity extends BaseEntity {
    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "form_variable_id")
    private FormVariableEntity formVariable;

    @Column(name = "variable_value", nullable = false)
    private String variableValue;

    @JdbcTypeCode(SqlTypes.JSON)
    @JdbcType(PostgreSQLJsonPGObjectJsonType.class)
    @Column(name = "variable_condition", columnDefinition = "jsonb")
    private Condition variableCondition;
}
