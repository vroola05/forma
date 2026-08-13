package org.commonground.forma.model.form.condition;

public enum ConditionType {
    SIMPLE(0),
    COMPOSITE(1);

    private final int value;

    ConditionType(int value) {
        this.value = value;
    }

    public int getValue() {
        return this.value;
    }
}
