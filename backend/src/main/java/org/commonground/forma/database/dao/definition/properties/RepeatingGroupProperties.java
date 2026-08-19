package org.commonground.forma.database.dao.definition.properties;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

public record RepeatingGroupProperties(
    String type,
    String layout
) implements FieldProperties {
    @JsonCreator
    public RepeatingGroupProperties(
        @JsonProperty("type") String type,
        @JsonProperty("layout") String layout

    ) {
        this.type = type;
        this.layout = layout;
    }

    @Override
    public String getType() {
        return this.type;
    }
}




