package org.commonground.forma.database.dao.translation;

import org.commonground.forma.database.dao.definition.FormDefinitionEntity;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "form_translations")
public class FormTranslation extends AbstractTranslation {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "form_id")
    private FormDefinitionEntity form;
}