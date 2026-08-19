package org.commonground.forma.model.form.fields;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.commonground.forma.exceptions.FieldValidationException;
import org.commonground.forma.model.form.Option;
import org.commonground.forma.model.form.condition.Condition;
import org.commonground.forma.model.form.constants.FieldType;

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
public class RepeatingGroup implements Field {
    private UUID id;
    private String name;
    private String label;
    private String classes;
    private String layout;
    private FieldType type;
    private Integer minLength;
    private Integer maxLength;

    private List<String> metadata;
    private List<Field> fields;
    private List<List<Field>> sets;
    private Condition condition;
    private Boolean show;

    @Override
    public String getLabel() {
        return this.label;
    }

    @Override
	public String getValue() {
		return null;
	}
    
    @Override
    public void setValue(String value) {
        
    }

    @Override
    public List<Option> getValues() {
        return null;
    }

    @Override
    public void setValues(List<Option> values) {
    }
    
    public Optional<Field> getField(List<Field> fields, String fieldName) {
        return fields.stream().filter(field -> field.getName().equalsIgnoreCase(fieldName)).findFirst();
    }

    @Override
    public Optional<Field> getField(String fieldName) {
        return fields.stream().filter(field -> field.getName().equals(fieldName)).findFirst();
    }

    public Optional<String> getFieldValue(List<Field> fields, String fieldName) {
        Optional<Field> fieldOptional = getField(fields, fieldName);
        return fieldOptional.isEmpty() ? Optional.empty() : Optional.of(fieldOptional.get().getValue());
    }

    public void setFieldValue(List<Field> fields, String fieldName, String value) {
        Optional<Field> fieldOptional = getField(fields, fieldName);
        if (fieldOptional.isEmpty())
            return;

        fieldOptional.get().setValue(value);
    }

    @Override
    public Field cloneField() {
        return null;
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
        return this.show == null || this.show;
    }

    @Override
    public void validate(Object value) throws FieldValidationException {
    }
}
