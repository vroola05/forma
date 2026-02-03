package org.commonground.formbuilder.model.form;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
public class TextField implements Field {
    private String id;
    private String name;
    private String label;

    private FieldType type;
    private String placeholder;
    private String classes;
    private Boolean readonly;
    private Boolean required;
    private Boolean show;
    private Integer minlength;
    private Integer maxlength;
    private String value;
    
    private List<String> metadata;

    private Map<String, String> data;
    private Condition condition;

    @JsonProperty("type")
    public void setTypeFromJson(String typeValue) {
        this.type = FieldType.fromValue(typeValue);
    }

    @Override
    public void setValue(String value) {
        this.value = value;
    }

    @Override
    public List<Option> getValues() {
        return null;
    }

    @Override
    public void setValues(List<Option> values) {
    }

    @Override
    public Field cloneField() {
        return new TextField(id, name, label, type, placeholder, classes, readonly, required, show, minlength, maxlength, value, metadata, data, condition);
    }

    @Override
    public Map<String, String> getData() {
        if (this.data == null) {
            this.data = new HashMap<>();
        }
        return this.data;
    }

    @Override
    public void setData(Map<String, String> data) {
        this.data = data;
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
    public List<Field> getFields() {
        return null;
    }

    @Override
    public void validate(Object value) throws FieldValidationException {
        if (value == null) {
            value = "";
        }

        String valueStr = (String)value;

        if (getRequired() != null && getRequired() && valueStr.isEmpty()) {
            throw new FieldValidationException(String.format("Het veld {} is verplicht", getLabel()));
        }

        if (getMinlength() != null && getMinlength() > 0 && valueStr.length() < getMinlength()) {
            throw new FieldValidationException(String.format("Het minimum aantal tekens voor {} is {}", getLabel(), getMinlength()));
        }

        if (getMaxlength() != null && getMaxlength() < 0 && valueStr.length() > getMaxlength()) {
            throw new FieldValidationException(String.format("Het maximum aantal tekens voor {} is {}", getLabel(), getMaxlength()));
        }
    }
}
