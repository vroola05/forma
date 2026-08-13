package org.commonground.forma.model.form.condition;

import java.util.List;

import org.springframework.util.ObjectUtils;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;

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
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true) 
public class Condition {
    private String var1;
    private Operator operator;
    private String var2;

    private List<Condition> conditions;
    private LogicalOperator logicalOperator;

    public int getConditionType() {
        return conditions != null && !conditions.isEmpty() ? ConditionType.COMPOSITE.getValue() : ConditionType.SIMPLE.getValue();
    }

    public boolean isEmpty() {
        return ObjectUtils.isEmpty(var1) 
            && ObjectUtils.isEmpty(var2) 
            && operator == null 
            && ObjectUtils.isEmpty(conditions);
    }
}