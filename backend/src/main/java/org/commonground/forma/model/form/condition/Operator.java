package org.commonground.forma.model.form.condition;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum Operator {
    EQI("eqi"),
    NEQI("neqi"),
    EQ("eq"),
    NEQ("neq"),
    GT("gt"),
    LT("lt"),
    GTE("gte"),
    LTE("lte");

    private final String value;

    Operator(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static Operator fromValue(String value) {
        for (Operator operator : Operator.values()) {
            if (operator.value.equalsIgnoreCase(value)) {
                return operator;
            }
        }
        throw new IllegalArgumentException("Unknown operator: " + value);
    }
}
