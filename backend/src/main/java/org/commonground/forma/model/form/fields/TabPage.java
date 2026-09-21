package org.commonground.forma.model.form.fields;

import java.util.ArrayList;
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
public class TabPage implements Field {
    private UUID id;
    private String name;
    @Builder.Default
    private List<Translation> labels = new ArrayList<>();
    private String classes;
    private Boolean sharedTab;
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
       
    public Boolean isSharedTab() {
        return this.sharedTab == null && this.sharedTab;
    }

    @Override
    public String getName() {
        return this.name;
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
    @SuppressWarnings("java:S1168")
    public String getValue() {
       return null;
    }

    @Override
    @SuppressWarnings("java:S1168")
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
    @SuppressWarnings("java:S1168")
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
        return this.show == null || this.show;
    }

    @Override
    public Field cloneField() {
        return null;
    }

    @Override
    public List<Field> getFields() {
        return this.fields.stream().map(field -> field).toList();
    }

    @Override
    public Optional<Field> getField(String fieldName) {
        return fields.stream().filter(field -> field.getName().equals(fieldName)).findFirst();
    }

    @Override
    public void validate(Object value) throws FieldValidationException {
    }
}
