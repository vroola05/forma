package org.commonground.forma.database.dao.translation;

import org.commonground.forma.database.dao.definition.FormTabDefinitionEntity;

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
@Table(name = "tab_translations")
@IdClass(TabTranslationId.class)
public class TabTranslationEntity  {
    @Id
    @ManyToOne
    @JoinColumn(name = "tab_id")
    private FormTabDefinitionEntity tab;

    @Id
    @Column(length = 10)
    private String locale;

    @Column(nullable = false)
    private String label;
}