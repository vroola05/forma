package org.commonground.forma.model.form.condition;

public record ConditionVariable (
    String word,
    String wordInner,
    ConditionVariableType type
) {}