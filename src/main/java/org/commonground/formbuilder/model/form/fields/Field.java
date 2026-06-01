package org.commonground.formbuilder.model.form.fields;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.commonground.formbuilder.exceptions.FieldValidationException;
import org.commonground.formbuilder.model.form.Option;
import org.commonground.formbuilder.model.form.condition.Condition;
import org.commonground.formbuilder.model.form.constants.FieldType;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

@JsonTypeInfo(
  use = JsonTypeInfo.Id.NAME,
  include = JsonTypeInfo.As.EXISTING_PROPERTY,
  property = "type",
  visible = true
)
@JsonSubTypes({
  @JsonSubTypes.Type(value = Form.class, name = "form"),
  @JsonSubTypes.Type(value = TabPage.class, name = "tab"),
  @JsonSubTypes.Type(value = FormGroup.class, name = "form-group"),
  @JsonSubTypes.Type(value = TextField.class, name = "label"),
  @JsonSubTypes.Type(value = TextField.class, name = "text"),
  @JsonSubTypes.Type(value = TextField.class, name = "textarea"),
  @JsonSubTypes.Type(value = TextField.class, name = "number"),
  @JsonSubTypes.Type(value = TextField.class, name = "valuta"),
  @JsonSubTypes.Type(value = TextField.class, name = "date"),
  @JsonSubTypes.Type(value = TextField.class, name = "hidden"),
  @JsonSubTypes.Type(value = RepeatingGroup.class, name = "repeating-group"),
  @JsonSubTypes.Type(value = SelectField.class, name = "select"),
  @JsonSubTypes.Type(value = CheckboxField.class, name = "checkbox"),
  @JsonSubTypes.Type(value = RadioField.class, name = "radio")
})
public interface Field {

    UUID getId();
    void setId(UUID id);
    String getName();
    void setName(String name);
    String getLabel();
    void setLabel(String label);
    String getClasses();
    void setClasses(String classes);
    List<String> getMetadata();
    void setMetadata(List<String> metadata);
    FieldType getType();
    void setType(FieldType type);
    Condition getCondition();
    void setCondition(Condition condition);

    String getValue();
    List<Option> getValues();
    void setValues(List<Option> values);

    void setValue(String value);

    Map<String, String> getData();
    void setData(Map<String, String> data);

    Field cloneField();

    void setShow(Boolean show);
    Boolean isShow();

    List<Field> getFields();
    void validate(Object value) throws FieldValidationException;
}
