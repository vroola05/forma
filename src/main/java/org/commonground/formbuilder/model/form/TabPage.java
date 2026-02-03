package org.commonground.formbuilder.model.form;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.commonground.formbuilder.exceptions.FieldValidationException;
import org.commonground.formbuilder.model.form.condition.Condition;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TabPage implements Field {
    private String name;
    private String label;
    private String classes;
    private List<String> metadata;
    private List<FormGroup> formGroups;
    private FieldType type;
    private Condition condition;
    private Boolean show;
    
    @JsonProperty("type")
    public void setTypeFromJson(String typeValue) {
        this.type = FieldType.fromValue(typeValue);
    }

    public Optional<FormGroup> getFormGroup(String formGroupName) {
        return formGroups.stream().filter(formGroup -> formGroup.getName().equals(formGroupName)).findFirst();
    }

    public Optional<Field> getField(String formGroupName, String fieldName) {
        Optional<FormGroup> formGroupOptional = formGroups.stream().filter(tab -> tab.getName().equals(formGroupName)).findFirst();
        return formGroupOptional.isEmpty() ? Optional.empty() : formGroupOptional.get().getField(fieldName);
    }

    public Optional<String> getFieldValue(String formGroupName, String fieldName) {
        Optional<Field> fieldOptional = getField(formGroupName, fieldName);
        return fieldOptional.isEmpty() ? Optional.empty() : Optional.of(fieldOptional.get().getValue());
    }
    
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
        return this.show;
    }

    @Override
    public Field cloneField() {
        return null;
    }

    @Override
    public List<Field> getFields() {
        return this.formGroups.stream().map(field -> (Field)field).toList();
    }

    @Override
    public void validate(Object value) throws FieldValidationException {
    }
}
