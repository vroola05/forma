package org.commonground.forma.database.dao.translation;

import org.commonground.forma.database.dao.definition.FormFieldDefinitionEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "field_translations")
@IdClass(FieldTranslationId.class)
public class FieldTranslationEntity  {
    @Id
    @ManyToOne
    @JoinColumn(name = "field_id")
    private FormFieldDefinitionEntity field;

    @Id
    @Column(length = 10)
    private String locale;

    @Column(nullable = false)
    private String label;
}