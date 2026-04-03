package org.commonground.formbuilder.model.form;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.commonground.formbuilder.exceptions.FieldValidationException;
import org.commonground.formbuilder.model.form.condition.Condition;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Form implements Field {
    private UUID id;
    private String name;
    private String label;
    private String classes;

    private List<String> metadata;
    private List<String> confirmation;
    @Builder.Default
    private List<CheckboxField> confirmationCheck = new ArrayList<>();
    @Builder.Default
    private List<TabPage> fields = new ArrayList<>();
    private FieldType type;
    private Condition condition;
    private Boolean show;
    
    @JsonProperty("type")
    public void setTypeFromJson(String typeValue) {
        this.type = FieldType.fromValue(typeValue);
    }

    public Optional<TabPage> getTab(String tabName) {
        return fields.stream().filter(tab -> tab.getName().equals(tabName)).findFirst();
    }

    // public Optional<FormGroup> getFormGroup(String tabName, String formGroupName) {
    //     Optional<TabPage> tabPageOptional = fields.stream().filter(tab -> tab.getName().equals(tabName)).findFirst();
    //     return tabPageOptional.isEmpty() ? Optional.empty() : tabPageOptional.get().getFormGroup(formGroupName);
    // }

    // public Optional<Field> getField(String tabName, String formGroupName, String fieldName) {
    //     Optional<TabPage> tabPageOptional = fields.stream().filter(tab -> tab.getName().equals(tabName)).findFirst();
    //     return tabPageOptional.isEmpty() ? Optional.empty() : tabPageOptional.get().getField(formGroupName, fieldName);
    // }

    // public Optional<String> getFieldValue(String tabName, String formGroupName, String fieldName) {
    //     Optional<Field> fieldOptional = getField(tabName, formGroupName, fieldName);
    //     return fieldOptional.isEmpty() ? Optional.empty() : Optional.of(fieldOptional.get().getValue());
    // }

    // public void setFieldValue(String tabName, String formGroupName, String fieldName, String value) {
    //     Optional<TabPage> tabPageOptional = fields.stream().filter(tab -> tab.getName().equals(tabName)).findFirst();
    //     if (tabPageOptional.isEmpty()) {
    //         return;
    //     }
    //     Optional<Field> fieldOptional = tabPageOptional.get().getField(formGroupName, fieldName);
    //     if (fieldOptional.isEmpty()) {
    //         return;
    //     }
    //     fieldOptional.get().setValue(value);
    // }

    // public List<TabPage> getTabPages() {
    //     return this.fields;
    // }

    @Override
    public String getName() {
        return this.name;
    }

    @Override
    public String getLabel() {
        return this.label;
    }

    @Override
    public String getClasses() {
        return this.classes;
    }

    @Override
    public List<String> getMetadata() {
        return this.metadata;
    }

    @Override
    public FieldType getType() {
        return this.type;
    }

    @Override
    public String getValue() {
       return null;
    }

    @Override
    public List<Option> getValues() {
        return null;
    }

    @Override
    public void setValues(List<Option> values) {
    }

    @Override
    public void setValue(String value) {
        
    }

    @Override
    public Map<String, String> getData() {
        return null;
    }

    @Override
    public void setData(Map<String, String> data) {
        
    }

    @Override
    public void setShow(Boolean show) {
        this.show = show;
    }

    @Override
    public Boolean isShow() {
        return this.show == null ? true : this.show;
    }

    @Override
    public Field cloneField() {
        return null;
    }

    @Override
    public List<Field> getFields() {
        return this.fields.stream().map(field -> (Field)field).toList();
    }

    @Override
    public void validate(Object value) throws FieldValidationException {
    }

}
