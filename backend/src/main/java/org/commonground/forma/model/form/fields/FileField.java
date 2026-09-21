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
public class FileField implements Field {
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
    private String value;
    private List<Option> values;

    private Boolean isMultiple;
    private Long maxFileSize;
    private Long maxFiles;
    private List<String> allowedExtensions;

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
        return values;
    }

    @Override
    public void setValues(List<Option> values) {
        this.values = values;
    }

    @Override
    public Field cloneField() {
        return null;
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
        
        if (value instanceof List<?> rawList) {
            @SuppressWarnings("unchecked")
            List<Option> options = (List<Option>) rawList;
            
            
            if (this.required != null && this.required && options.isEmpty()) {
                throw new FieldValidationException("{form.validation.required.field}");
            }
            
        } else if (value != null) {
            throw new FieldValidationException("CheckboxField verwacht een lijst met opties.");
        }

        
    }
}
