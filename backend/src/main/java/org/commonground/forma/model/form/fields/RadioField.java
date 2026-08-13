package org.commonground.forma.model.form.fields;

import java.util.ArrayList;
import java.util.HashMap;
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
public class RadioField implements Field {
    private UUID id;
    private String name;
    private String label;

    private FieldType type;
    private String placeholder;
    private String classes;
    private Boolean readonly;
    private Boolean required;
    private Boolean show;
    private String value;
    private List<String> metadata;
    private List<Option> options;
    private List<Option> values;

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
    public void setValues(List<Option> values) {
    }
    
    @Override
    public Field cloneField() {
        return new RadioField(id, name, label, type, placeholder, classes, readonly, readonly, show, value, metadata, cloneOptions(options), cloneOptions(values), data, condition);
    }

    public List<Option> cloneOptions(List<Option> options) {
        List<Option> result = new ArrayList<>();
        if (options != null) {
            options.forEach(opt -> {
                result.add(opt.clone());
            });
        }
        return result;
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
        return this.show != null ? this.show : true;
    }
    
    @Override
    public List<Field> getFields() {
        return null;
    }

    @Override
    public Optional<Field> getField(String fieldName) {
        return Optional.empty();
    }

    @Override
    public void validate(Object value) throws FieldValidationException {
    }
}
