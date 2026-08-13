package org.commonground.forma.model.form.condition;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum LogicalOperator {
    AND("and"),
    OR("or");

    private final String value;

    LogicalOperator(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static LogicalOperator fromValue(String value) {
        for (LogicalOperator logicalOperator : LogicalOperator.values()) {
            if (logicalOperator.value.equalsIgnoreCase(value)) {
                return logicalOperator;
            }
        }
        throw new IllegalArgumentException("Unknown operator: " + value);
    }
}
