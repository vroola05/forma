package org.commonground.forma.model.form;

import java.util.UUID;

import org.commonground.forma.model.form.condition.Condition;

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
public class VariableValue {
    private UUID id;
    private String value;
    private Condition conditions;
}
