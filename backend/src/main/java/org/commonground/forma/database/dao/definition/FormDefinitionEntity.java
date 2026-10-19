package org.commonground.forma.database.dao.definition;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import org.commonground.forma.database.dao.BaseEntity;
import org.commonground.forma.database.dao.translation.FormTranslationEntity;
import org.commonground.forma.model.constants.FormStatus;
import org.commonground.forma.model.form.condition.Condition;
import org.hibernate.annotations.Fetch;
import org.hibernate.annotations.FetchMode;
import org.hibernate.annotations.JdbcType;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.dialect.type.PostgreSQLJsonPGObjectJsonType;
import org.hibernate.type.SqlTypes;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "form_definition")
public class FormDefinitionEntity extends BaseEntity {
    @Id
    private UUID id;
    @Column(nullable = false)
    private String name;
    private String classes;

    @Column(nullable = false)
    private UUID tenantId;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "metadata", columnDefinition = "text[]")
    private List<String> metadata;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "summary_confirmation", columnDefinition = "text[]")
    private List<String> confirmation;

    @JdbcTypeCode(SqlTypes.JSON)
    @JdbcType(PostgreSQLJsonPGObjectJsonType.class)
    @Column(columnDefinition = "jsonb")
    private Condition condition;
    private boolean show;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private FormStatus status;

    @OneToMany(mappedBy = "form", cascade = CascadeType.ALL, orphanRemoval = true)
    @Fetch(FetchMode.SUBSELECT)
    private List<FormTranslationEntity> labels = new ArrayList<>();

    @OneToMany(mappedBy = "form", cascade = CascadeType.ALL, orphanRemoval = true)
    @Fetch(FetchMode.SUBSELECT)
    private List<FormTabInstanceDefinitionEntity> tabs = new ArrayList<>();

    @OneToOne(mappedBy = "form", cascade = CascadeType.ALL, orphanRemoval = true)
    private FormConfigSuccessPageEntity successPage;

    @OneToMany(mappedBy = "form", cascade = CascadeType.ALL, orphanRemoval = true)
    @Fetch(FetchMode.SUBSELECT)
    private List<FormVariableEntity> variables = new ArrayList<>();

    public List<String> getMetadata() {
        return metadata == null ? null : metadata;
    }

    public List<String> getConfirmation() {
        return confirmation == null ? null : confirmation;
    }

    public void retainTabs(Set<UUID> incomingIds) {
        this.tabs.removeIf(tab -> !incomingIds.contains(tab.getTab().getId()));
    }

    public void addTabInstance(FormTabInstanceDefinitionEntity tabInstance) {
        this.tabs.add(tabInstance);
        tabInstance.setForm(this);
    }

    public void retainTabs(List<UUID> incomingTabIds) {
        this.tabs.removeIf(instance -> !incomingTabIds.contains(instance.getTab().getId()));
    }

    public void clearSuccessPage() {
        if (this.successPage != null) {
            this.successPage.setForm(null);
            this.successPage = null;
        }
    }

    public void setSuccessPage(FormConfigSuccessPageEntity successPage) {
        if (successPage == null) {
            if (this.successPage != null) {
                this.successPage.setForm(null);
            }
        } else {
            successPage.setForm(this);
        }
        
        this.successPage = successPage;
    }


    public void retainVariables(List<UUID> incomingVariableIds) {
        this.variables.removeIf(instance -> !incomingVariableIds.contains(instance.getId()));
    }


    public void addFormVariable(FormVariableEntity formVariableEntity) {
        this.variables.add(formVariableEntity);
        formVariableEntity.setForm(this);
    }
}
