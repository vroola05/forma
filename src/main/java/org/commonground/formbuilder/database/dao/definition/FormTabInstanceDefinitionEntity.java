package org.commonground.formbuilder.database.dao.definition;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "form_tab_instance_definition")
@IdClass(FormTabInstanceIdEntity.class)
public class FormTabInstanceDefinitionEntity {
    @Id
    @ManyToOne
    @JoinColumn(name = "form_id")
    private FormDefinitionEntity form;

    @Id
    @ManyToOne
    @JoinColumn(name = "tab_id")
    private FormTabDefinitionEntity tab;

    @Column(name = "sort_order", nullable = false)
    private int sortOrder;
}
