package org.commonground.forma.model.form.fields;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.commonground.forma.exceptions.FieldValidationException;
import org.commonground.forma.model.form.Option;
import org.commonground.forma.model.form.condition.Condition;
import org.commonground.forma.model.form.constants.FieldType;

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
public class FormGroup implements Field {
    private UUID id;
    private String name;
    private String label;
    private String classes;
    private List<String> metadata;
    @Builder.Default
    private List<Field> fields = new ArrayList<>();
    private FieldType type;

    private Condition condition;
    private Boolean show;

    @JsonProperty("type")
    public void setTypeFromJson(String typeValue) {
        this.type = FieldType.fromValue(typeValue);
    }

    public Optional<Field> getFieldByLabel(String fieldLabel) {
        return fields.stream().filter(field -> field.getLabel().equals(fieldLabel)).findFirst();
    }

    public Optional<Field> getField(String fieldName) {
        return fields.stream().filter(field -> field.getName().equals(fieldName)).findFirst();
    }

    public Optional<String> getFieldValue(String fieldName) {
        Optional<Field> fieldOptional = getField(fieldName);
        return fieldOptional.isEmpty() ? Optional.empty() : Optional.of(fieldOptional.get().getValue());
    }

    public Optional<List<Option>> getFieldValues(String fieldName) {
        Optional<Field> fieldOptional = getField(fieldName);
        return fieldOptional.isEmpty() ? Optional.empty() : Optional.of(fieldOptional.get().getValues());
    }

    public void setFieldValue(String fieldName, String value) {
        Optional<Field> fieldOptional = getField(fieldName);
        if (fieldOptional.isEmpty()) {
            return;
        }
        fieldOptional.get().setValue(value);
    }
    public void setFieldValues(String fieldName, List<Option> values) {
        Optional<Field> fieldOptional = getField(fieldName);
        if (fieldOptional.isEmpty()) {
            return;
        }
        fieldOptional.get().setValues(values);
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
        return this.show == null ? true : this.show;
    }

    @Override
    public Field cloneField() {
        return null;
    }

    @Override
    public List<Field> getFields() {
        return this.fields;
    }

    @Override
    public void validate(Object value) throws FieldValidationException {
    }
}
