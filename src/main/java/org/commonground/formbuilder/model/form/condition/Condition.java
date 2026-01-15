package org.commonground.formbuilder.model.form.condition;

import java.util.List;

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
public class Condition {
    private String var1;
    private Operator operator;
    private String var2;

    private List<Condition> conditions;
    private LogicalOperator logicalOperator;

    public ConditionType getConditionType() {
        return conditions != null && !conditions.isEmpty() ? ConditionType.COMPOSITE : ConditionType.SIMPLE;
    }
}