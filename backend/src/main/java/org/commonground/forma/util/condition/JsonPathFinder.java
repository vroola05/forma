package org.commonground.forma.util.condition;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.regex.Matcher;

import org.commonground.forma.model.form.Variable;
import org.commonground.forma.model.form.VariableValue;
import org.commonground.forma.model.form.condition.ConditionVariable;
import org.commonground.forma.model.form.condition.ConditionVariableType;
import org.commonground.forma.model.form.constants.FieldType;
import org.commonground.forma.model.form.fields.Field;
import org.commonground.forma.util.RegexConstants;

public class JsonPathFinder {
    Map<String, String> history = new HashMap<>();

    private JsonPathFinder() {
    }

    public static List<String> eval(String input, Field field, List<Variable> pageVariables) {
        JsonPathFinder jsonPathFinder = new JsonPathFinder();

        List<ConditionVariable> conditionVariables = jsonPathFinder.getVariables(input);
        if (conditionVariables.isEmpty()) {
            return List.of(input);
        }

        return jsonPathFinder.evalTokenized(input, conditionVariables, field, pageVariables);
    }

    public static String evalText(String input, Field field, List<Variable> pageVariables) {
        JsonPathFinder jsonPathFinder = new JsonPathFinder();

        List<ConditionVariable> conditionVariables = jsonPathFinder.getVariables(input);
        for (ConditionVariable conditionVariable : conditionVariables) {
            List<String>  result = new ArrayList<>();
            result.add(conditionVariable.word());
            result = jsonPathFinder.getFieldValue(result, conditionVariable, field, pageVariables);
            
            input = input.replace(conditionVariable.word(), String.join(", ", result));
        }

        return input;
    }
    /**
     * Returns a list with all the values of a specific input it returns a list because it is posible to use jsonpath like expressions
     * 
     * @param input - this is the complete inputfield with variable on it for example: "${form.tab.field1}, ${form.tab.field2} and #{variable1}"
     * @param conditionVariables - This list can be created with JsonPathFinder.getVariables(String input)
     * @param field - The source Field that contains all form fields for for example a Form
     * @param pageVariables - All the page variables that are used in a specific form
     * @return
     */
    private List<String> evalTokenized(String input, List<ConditionVariable> conditionVariables, Field field, List<Variable> pageVariables) {
        List<String> output = List.of(input);
        for (ConditionVariable conditionVariable: conditionVariables) {
            output = getFieldValue(output, conditionVariable, field, pageVariables);
        }
        return output;
    }

    private List<String> getFieldValue(List<String> inputs, ConditionVariable conditionVariable, Field field, List<Variable> pageVariables) {
        List<String> output = new ArrayList<>();
        // If the type of variable is a form field:
        // Retreive the value from the form
        if (ConditionVariableType.FORM_VALUE.equals(conditionVariable.type())) {
            List<Field> tokenizedFields = evalTokenizedFields(conditionVariable.wordInner(), field);
            output = getFieldValues(inputs, conditionVariable.word(), tokenizedFields);

        // If the type of variable is a page variable, 
        } else if (ConditionVariableType.PAGE_VAR.equals(conditionVariable.type())) {
            Optional<Variable> variableOptional = pageVariables.stream().filter(pageVariable -> 
                pageVariable.getName() != null && pageVariable.getName().equals(conditionVariable.wordInner())).findFirst();
            
            if (variableOptional.isPresent()) {
                Variable variable = variableOptional.get();
                if (history.containsKey(variable.getName())) {
                    throw new RuntimeException("Circulair loop in var:" + variable.getName());
                }
                history.put(variable.getName(), variable.getName());

                List<VariableValue> variableValues = variable.getValues();

                String value = getVariableValue(variableValues, field);

                output = evalTokenized(value, getVariables(value), field, pageVariables);
            }
        }
        return output;
    }

    private String getVariableValue(List<VariableValue> variableValues, Field field) {
        for (VariableValue variableValue: variableValues) {
            if (variableValue.getConditions() == null || ConditionParser.checkCondition(field, variableValue.getConditions())) {
                return variableValue.getValue();
            }
        }
        return null;
    }

    private List<Field> evalTokenizedFields(String path, Field input) {
        List<Field> results = new ArrayList<>();
        List<String> tokens = JsonPathTokenizer.tokenize(path.toCharArray());

        evaluateRecursive(tokens, 0, input, results);
        return results;
    }

    private List<String> getFieldValues(List<String> paths, String replace, List<Field> fields) {
        List<String> output = new ArrayList<>();
        for (String path : paths) {
            for (Field field : fields) {
                if (
                    FieldType.CHECKBOX.equals(field.getType())
                    || FieldType.SELECT.equals(field.getType())
                    || FieldType.RADIO.equals(field.getType())) {

                        if(field.getValues() == null) {
                            continue;
                        }

                        List<String> optionValues = field.getValues().stream().map(option -> option.getValue()).toList();

                        output.add(path.replace(replace,String.join(", ", optionValues)));
                } else {
                    output.add(path.replace(replace, field.getValue()));
                }
            }
        }
        return output;
    }


    private void evaluateRecursive(List<String> tokens, int tokenIndex, Field currentField,
            List<Field> results) {

        // 1. Basis: we zijn aan het einde van het pad
        if (tokenIndex >= tokens.size() - 1) {
            if (currentField.getName().equals(tokens.get(tokens.size() - 1))) {
                results.add(currentField);
            }
            return;
        } else {
        }
        String token = tokens.get(tokenIndex);
        

        // 2. Afhandelen van de Root token ($)
        if ("$".equals(token)) {
            evaluateRecursive(tokens, tokenIndex + 1, currentField, results);
            return;
        }

        // 3. Afhandelen van Deep Scan (..)
        if ("..".equals(token)) {
            if (tokenIndex + 1 >= tokens.size())
                throw new RuntimeException("Pad mag niet eindigen met ..");
            String nextToken = tokens.get(tokenIndex + 1);
            // Zoek recursief in de hele boom naar velden die matchen met nextToken
            searchDeep(currentField, nextToken, tokens, tokenIndex + 2, results);
            return;
        }

        // 4. Afhandelen van Index/Slice/Wildcard ([...])
        if (token.startsWith("[")) {
            List<Field> children = currentField.getFields();
            if (children == null || children.isEmpty())
                return;

            String content = token.substring(1, token.length() - 1);
            if ("*".equals(content)) {
                for (Field child : children) {
                    evaluateRecursive(tokens, tokenIndex + 1, child, results);
                }
            } else if (content.contains(":")) {
                // Slice logica (bijv. 0:5)
                String[] parts = content.split(":", -1);
                int start = parts[0].isEmpty() ? 0 : Integer.parseInt(parts[0]);
                int end = parts[1].isEmpty() ? children.size() : Integer.parseInt(parts[1]);
                for (int i = Math.max(0, start); i < Math.min(children.size(), end); i++) {
                    evaluateRecursive(tokens, tokenIndex + 1, children.get(i), results);
                }
            } else {
                // Harde index (bijv. [2])
                int idx = Integer.parseInt(content);
                if (idx >= 0 && idx < children.size()) {
                    evaluateRecursive(tokens, tokenIndex + 1, children.get(idx), results);
                }
            }
            return;
        }

        // 5. Normale veldnaam match
        if (token.equals(currentField.getName())) {
            // Als de huidige token matcht met de huidige field-naam,
            // gaan we naar de volgende token met de kinderen van dit veld.
            List<Field> children = currentField.getFields();
            if (children != null) {
                for (Field child : children) {
                    evaluateRecursive(tokens, tokenIndex + 1, child, results);
                }
            }
        } else {
            // Geen match? Dan stopt dit pad hier voor dit specifieke veld.
        }
    }

    // Helper voor de .. operator
    private void searchDeep(Field root, String targetName, List<String> tokens, int nextTokenIdx, List<Field> results) {
        if (targetName.equals(root.getName())) {
            evaluateRecursive(tokens, nextTokenIdx, root, results);
        }

        List<Field> children = root.getFields();
        if (children != null) {
            for (Field child : children) {
                searchDeep(child, targetName, tokens, nextTokenIdx, results);
            }
        }
    }


    public List<ConditionVariable> getVariables(String input) {
        List<ConditionVariable> conditionVariables = new ArrayList<>();

        Matcher matcher = RegexConstants.PAGE_VAR.matcher(input);
        while (matcher.find()) {
            String fullMatch = matcher.group(1);
            String cleanName = matcher.group(2);

            conditionVariables.add(new ConditionVariable(fullMatch, cleanName, getVariableType(fullMatch)));
        }
        

        return conditionVariables;
    }

    private ConditionVariableType getVariableType(String variable) {
        if (variable == null || variable.isEmpty()) {
            return ConditionVariableType.TEXT;
        } else if (variable.startsWith("$")) {
            return ConditionVariableType.FORM_VALUE;
        } if (variable.startsWith("#")) {
            return ConditionVariableType.PAGE_VAR;
        }
        return ConditionVariableType.TEXT;
    }
}
