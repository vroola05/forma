package org.commonground.forma.database.dao.translation;

import org.commonground.forma.database.dao.definition.FormDefinitionEntity;

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
@Table(name = "form_translations")
@IdClass(FormTranslationId.class)
public class FormTranslationEntity  {
    @Id
    @ManyToOne
    @JoinColumn(name = "form_id")
    private FormDefinitionEntity form;

    @Id
    @Column(length = 10)
    private String locale;

    @Column(nullable = false)
    private String label;
}