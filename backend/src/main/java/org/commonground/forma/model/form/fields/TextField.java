package org.commonground.forma.model.form.fields;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.commonground.forma.exceptions.FieldValidationException;
import org.commonground.forma.model.form.Option;
import org.commonground.forma.model.form.Translation;
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
public class TextField implements Field {
    private UUID id;
    private String name;
    @Builder.Default
    private List<Translation> labels = new ArrayList<>();
    private FieldType type;
    private String placeholder;
    private String classes;
    private Boolean readonly;
    private Boolean required;
    private Boolean show;
    private Integer minLength;
    private Integer maxLength;
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
    @SuppressWarnings("java:S1168")
    public List<Option> getValues() {
        return null;
    }

    @Override
    public void setValues(List<Option> values) {
        // Only needed in option fields
    }

    @Override
    public Field cloneField() {
        return new TextField(id, name, labels, type, placeholder, classes, readonly, required, show, minLength, maxLength, value, metadata, data, condition);
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
        return this.show == null || this.show;
    }
    
    @Override
    @SuppressWarnings("java:S1168")
    public List<Field> getFields() {
        return null;
    }

    @Override
    public Optional<Field> getField(String fieldName) {
        return Optional.empty();
    }

    @Override
    public void validate(Object value) throws FieldValidationException {
        if (value == null) {
            value = "";
        }

        String valueStr = (String)value;

        if (this.required != null && this.required && valueStr.isEmpty()) {
            throw new FieldValidationException("{form.validation.required.field}");
        }

        if (this.minLength != null && this.minLength >= 0 && valueStr.length() < this.minLength) {
            throw new FieldValidationException("{form.validation.minlength}", this.minLength);
        }

        if (this.maxLength != null && this.maxLength >= 0 && valueStr.length() > this.maxLength) {
            throw new FieldValidationException("{form.validation.maxlength}", this.maxLength);
        }
    }
}
