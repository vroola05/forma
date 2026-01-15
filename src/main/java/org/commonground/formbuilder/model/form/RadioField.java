package org.commonground.formbuilder.model.form;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
public class RadioField implements Field {
    private String id;
    private String name;
    private String label;

    private FieldType type;
    private String placeholder;
    private String classes;
    private Boolean readonly;
    private Boolean required;

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
        return new RadioField(id, name, label, type, placeholder, classes, readonly, readonly, value, metadata, cloneOptions(options), cloneOptions(values), data, condition);
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
    public List<Field> getFields() {
        return null;
    }
}
