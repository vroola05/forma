package org.commonground.formbuilder.model.form.fields;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.commonground.formbuilder.exceptions.FieldValidationException;
import org.commonground.formbuilder.model.form.Option;
import org.commonground.formbuilder.model.form.condition.Condition;
import org.commonground.formbuilder.model.form.constants.FieldType;

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
public class SelectField implements Field {
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
    private List<Option> values;
    private List<String> metadata;
    private List<Option> options;

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
        this.values = values;
    }

    @Override
    public Field cloneField() {
        return new SelectField(id, name, label, type, placeholder, classes, readonly, readonly, show, value, cloneOptions(values), metadata, cloneOptions(options), data, condition);
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
    public void validate(Object value) throws FieldValidationException {
    }
}
