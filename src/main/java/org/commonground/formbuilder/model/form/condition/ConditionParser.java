package org.commonground.formbuilder.model.form.condition;

import java.util.ArrayList;
import java.util.List;

import org.commonground.formbuilder.model.FormWrapper;
import org.commonground.formbuilder.model.form.Field;
import org.commonground.formbuilder.model.form.FieldType;
import org.commonground.formbuilder.model.form.Form;
import org.commonground.formbuilder.services.FormServiceLocal;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;

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
    public static boolean checkLogic(Form form, Condition condition) {
        if( condition.getConditionType() == ConditionType.COMPOSITE) {
            if( condition.getLogicalOperator() == null) {
                throw new IllegalArgumentException("Composite conditions must have a logical operator.");
            }
            if( condition.getConditions() == null || condition.getConditions().isEmpty()) {
                throw new IllegalArgumentException("Composite conditions must contain at least one sub-condition.");
            }
            for(Condition subCondition : condition.getConditions()) {
                if (condition.getLogicalOperator() == LogicalOperator.AND) {
                    if (!checkLogic(form, subCondition)) {
                        return false;
                    }
                } else if (condition.getLogicalOperator() == LogicalOperator.OR) {
                    if (checkLogic(form, subCondition)) {
                        return true;
                    }
                }
                throw new IllegalArgumentException("Composite conditions must have a logical operator.");
            }
        } else {
            if( condition.getVar1() == null || condition.getVar1().isEmpty() || condition.getOperator() == null) {
                throw new IllegalArgumentException("Simple conditions must have a field and an operator.");
            }
            return evaluateCondition(form, condition);
        }
        return true;
    }

    public static boolean evaluateCondition(Form form, Condition condition) {
        String field = condition.getVar1();
        if (field.startsWith("var.")) {

            field = field.substring(4);
            String[] fields = field.split("\\.");
            if (fields.length < 2) {
                throw new IllegalArgumentException("Invalid variable path: " + condition.getVar1());
            }
            if (fields.length > 5) {
                throw new IllegalArgumentException("Variable path too deep: " + condition.getVar1());
            }
            return true;
            // return evaluatePath(form, fields, 0);
        }

        return checkValue(field, condition.getOperator(), condition.getVar2());
    }



    public static void getBase(String name, Field base, char[] path, int index) {
        if (!base.getName().equals(name)) {
            throw new IllegalArgumentException("Element " + name + " doesn't exist");
        }

    }

    public static boolean checkValue(String fieldValue, Operator operator, String conditionValue) {
        switch (operator) {
            case EQ:
                return fieldValue.equals(conditionValue);
            case NEQ:
                return !fieldValue.equals(conditionValue);
            case GT:
                return compareDouble(fieldValue, conditionValue) > 0;
            case LT:
                return compareDouble(fieldValue, conditionValue) < 0;
            case GTE:
                return compareDouble(fieldValue, conditionValue) >= 0;
            case LTE:
                return compareDouble(fieldValue, conditionValue) <= 0;
            default:
                throw new IllegalArgumentException("Unsupported operator: " + operator);
        }
    }

    public static int compareDouble(String fieldValue, String conditionValue) {
        try {
            Double fieldDouble = Double.parseDouble(fieldValue);
            Double conditionDouble = Double.parseDouble(conditionValue);
            return fieldDouble.compareTo(conditionDouble);
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Values must be numeric for comparison operators.", e);
        }
    }
    
}
