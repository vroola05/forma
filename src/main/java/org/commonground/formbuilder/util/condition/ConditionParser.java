package org.commonground.formbuilder.util.condition;

import java.util.ArrayList;
import java.util.List;

import org.commonground.formbuilder.model.form.Field;
import org.commonground.formbuilder.model.form.FieldType;
import org.commonground.formbuilder.model.form.Form;
import org.commonground.formbuilder.model.form.condition.Condition;
import org.commonground.formbuilder.model.form.condition.ConditionType;
import org.commonground.formbuilder.model.form.condition.LogicalOperator;
import org.commonground.formbuilder.model.form.condition.Operator;

/**
 * Ik gebruik een vereenvoudigde JSONPath-syntaxis om logica te definiëren binnen formulieren.
 * $                        - De root identifier; verwijst naar het begin van het JSON-document.	$
 * . of []                  - Child segment; toegang tot een objecteigenschap of array-index.	$.store of $[0]
 * ..                       - Recursive descent; zoekt naar matches op alle diepteniveaus.	$..author
 * *                        - Wildcard; matcht alle elementen of velden.	$.books[*]
 * [start:end:step]         - Array slice; selecteert een reeks elementen uit een array.	$.books[0:5:2]
 * 
 * Voorbeelden van JSONPath-expressies:
 * $.winkel.locatie	        - Eenvoudig pad: Selecteert een specifieke waarde via dot-notatie.	"Utrecht"
 * $.winkel.boeken[*].titel	- Wildcard: Haalt alle titels op uit de boeken-array.	["Java Expert", "JSON Mastery", "RFC Gids"]
 * $..prijs	                - Deep scan: Zoekt alle velden met de naam "prijs", ongeacht de diepte.	[35.50, 20.00, 15.00]
 * $.winkel.boeken[0,2]	    - Multiple selectors: Selecteert het eerste en derde element (index 0 en 2).	De 1e en 3e boek-objecten.
 * $.winkel.boeken[-1:]	    - Slice (negatief): Selecteert het laatste element uit de array.	Het object voor "RFC Gids".
 */
public class ConditionParser {
    public static boolean checkCondition(Form form, Condition condition) {
        if( condition.getConditionType() == ConditionType.COMPOSITE) {
            if( condition.getLogicalOperator() == null) {
                throw new IllegalArgumentException("Composite conditions must have a logical operator.");
            }
            if( condition.getConditions() == null || condition.getConditions().isEmpty()) {
                throw new IllegalArgumentException("Composite conditions must contain at least one sub-condition.");
            }

            if (condition.getLogicalOperator() == LogicalOperator.AND) {
                return condition.getConditions().stream().allMatch(subCondition -> checkCondition(form, subCondition));

            } else if (condition.getLogicalOperator() == LogicalOperator.OR) {
                return condition.getConditions().stream().anyMatch(subCondition -> checkCondition(form, subCondition));
            }
        } else {
            if (condition.getOperator() == null) {
                throw new IllegalArgumentException("Operator is required.");
            }

            if (condition.getVar1() == null || condition.getVar1().isEmpty()) {
                throw new IllegalArgumentException("Var1 is required.");
            }

            if (condition.getVar2() == null || condition.getVar2().isEmpty()) {
                throw new IllegalArgumentException("Var2 is required.");
            }

            return evaluateCondition(form, condition);
        }
        return true;
    }

    private static boolean isField(String input) {
        return input.startsWith("$.");
    }

    private static boolean evaluateCondition(Form form, Condition condition) {
        List<String> var1Values = new ArrayList<>();
        List<String> var2Values = new ArrayList<>();

        if (isField(condition.getVar1())) {
            var1Values = getFieldValues(JsonPathFinder.evalTokenized(condition.getVar1(), form));
        } else {
            var1Values.add(condition.getVar1());
        }
        
        if (isField(condition.getVar2())) {
            var2Values = getFieldValues(JsonPathFinder.evalTokenized(condition.getVar2(), form));
        } else {
            var2Values.add(condition.getVar2());
        }

        for (String value1 : var1Values) {
            for (String value2 : var2Values) {
                if (!checkValue(value1, condition.getOperator(), value2)) {
                    return false;
                }
            }
        }
        return true;
    }

    private static List<String> getFieldValues(List<Field> fields) {
        List<String> output = new ArrayList<>();
        for (Field field : fields) {
            if (
                FieldType.CHECKBOX.equals(field.getType())
                || FieldType.SELECT.equals(field.getType())
                || FieldType.RADIO.equals(field.getType())) {
                System.out.println("getFieldValues: " + field.getName());
            } else {
                output.add(field.getValue());
            }
        }
        return output;
    }

    private static boolean checkValue(String var1Value, Operator operator, String var2Value) {
        switch (operator) {
            case EQI:
                return var1Value.equalsIgnoreCase(var2Value);
            case NEQI:
                return !var1Value.equalsIgnoreCase(var2Value);
            case EQ:
                return var1Value.equals(var2Value);
            case NEQ:
                return !var1Value.equals(var2Value);
            case GT:
                return compareDouble(var1Value, var2Value) > 0;
            case LT:
                return compareDouble(var1Value, var2Value) < 0;
            case GTE:
                return compareDouble(var1Value, var2Value) >= 0;
            case LTE:
                return compareDouble(var1Value, var2Value) <= 0;
            default:
                throw new IllegalArgumentException("Unsupported operator: " + operator);
        }
    }

    private static int compareDouble(String var1Value, String var2Value) {
        try {
            Double fieldDouble = Double.parseDouble(var1Value);
            Double conditionDouble = Double.parseDouble(var2Value);
            return fieldDouble.compareTo(conditionDouble);
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Values must be numeric for comparison operators.", e);
        }
    }
    
}
