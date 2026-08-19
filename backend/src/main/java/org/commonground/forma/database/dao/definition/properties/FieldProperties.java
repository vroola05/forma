package org.commonground.forma.database.dao.definition.properties;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

@JsonTypeInfo(
  use = JsonTypeInfo.Id.NAME, 
  include = JsonTypeInfo.As.PROPERTY, 
  property = "type",
  visible = true
)
@JsonSubTypes({
  @JsonSubTypes.Type(value = FileFieldProperties.class, name = "file"),
  @JsonSubTypes.Type(value = RepeatingGroupProperties.class, name = "repeating-group")
})
public interface FieldProperties {
  String getType();
}


