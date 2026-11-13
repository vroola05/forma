package org.commonground.forma.database.dao.definition;


import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import org.commonground.forma.database.dao.BaseEntity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
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
@Table(name = "form_variable")
public class FormVariableEntity extends BaseEntity {
    @Id
    private UUID id;
    
    
    @Column(nullable = false)
    private UUID tenantId;

    @Column(name = "variable_name", nullable = false)
    private String variableName;
    
    @ManyToOne
    @JoinColumn(name = "form_definition_id")
    private FormDefinitionEntity form;

    @ManyToMany(fetch = FetchType.LAZY, cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinTable(
        name = "form_variable_tag",
        joinColumns = @JoinColumn(name = "form_variable_id"),
        inverseJoinColumns = {
            @JoinColumn(name = "tenant_id", referencedColumnName = "tenant_id"),
            @JoinColumn(name = "tag_name", referencedColumnName = "tag_name")
        }
    )
    private List<TagEntity> tags = new ArrayList<>();

    @OneToMany(mappedBy = "formVariable", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<FormVariableValueEntity> values = new HashSet<>();

    public void addValue(FormVariableValueEntity value) {
        values.add(value);
        value.setFormVariable(this);
    }

    public void removeValue(FormVariableValueEntity value) {
        values.remove(value);
        value.setFormVariable(null);
    }

    public void addTag(TagEntity tag) {
        if (!this.tags.contains(tag)) {
            tags.add(tag);
        }
    }

    public void retainValues(List<UUID> incomingVariableIds) {
        this.values.removeIf(instance -> !incomingVariableIds.contains(instance.getId()));
    }

}
