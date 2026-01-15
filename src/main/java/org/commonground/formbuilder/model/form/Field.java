package org.commonground.formbuilder.model.form;

import java.util.List;
import java.util.Map;

import org.commonground.formbuilder.model.form.condition.Condition;

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

    String getName();
    String getLabel();
    String getClasses();
    List<String> getMetadata();
    FieldType getType();
    Condition getCondition();
    
    String getValue();
    List<Option> getValues();
    void setValues(List<Option> values);

    void setValue(String value);

    Map<String, String> getData();
    void setData(Map<String, String> data);

    Field cloneField();

    List<Field> getFields();
}
