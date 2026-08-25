package org.commonground.forma.database.dao.definition;

import java.util.UUID;

import org.commonground.forma.database.dao.BaseEntity;
import org.commonground.forma.model.editor.TiptapNode;
import org.hibernate.annotations.JdbcType;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.dialect.type.PostgreSQLJsonPGObjectJsonType;
import org.hibernate.type.SqlTypes;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;


@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "form_config_success_page")
public class FormConfigSuccessPageEntity extends BaseEntity {
    @Id
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "form_definition_id", nullable = true) 
    private FormDefinitionEntity form;

    private UUID tenantId;
    
    @Column(name = "is_global_default", nullable = false)
    private boolean isGlobalDefault = false;

    private String templateName;
    private String templateTitle;
    
    @JdbcTypeCode(SqlTypes.JSON)
    @JdbcType(PostgreSQLJsonPGObjectJsonType.class)
    @Column(columnDefinition = "jsonb")
    private TiptapNode template;
    @Column(nullable = false)
    private boolean showSummary;

}
