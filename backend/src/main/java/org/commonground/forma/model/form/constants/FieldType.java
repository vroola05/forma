package org.commonground.forma.model.form.constants;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum FieldType {
    FORM("form"),
    TAB("tab"),
    FORM_GROUP("form-group"),
    LABEL("label"),
    TEXT("text"),
    TEXTAREA("textarea"),
    NUMBER("number"),
    VALUTA("valuta"),
    COLOR("color"),
    DATE("date"),
    HIDDEN("hidden"),
    PASSWORD("password"),
    FILE("file"),
    REPEATING_GROUP("repeating-group"),
    CHECKBOX("checkbox"),
    SELECT("select"),
    DUAL_LISTBOX("dual-listbox"),
    RADIO("radio");

    private final String value;

    FieldType(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static FieldType fromValue(String value) {
        for (FieldType type : FieldType.values()) {
            if (type.value.equalsIgnoreCase(value)) {
                return type;
            }
        }
        throw new IllegalArgumentException("Unknown field type: " + value);
    }
}
