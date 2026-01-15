package org.commonground.formbuilder.model.form.condition;

import java.util.ArrayList;
import java.util.List;

import org.commonground.formbuilder.model.form.Field;

public class JsonPathFinder {
    public static List<Field> evalTokenized(String path, Field input) {
        List<Field> results = new ArrayList<>();
        evaluateRecursive(JsonPathTokenizer.tokenize(path.toCharArray()), 0, input, results);
        return results;
    }

    private static void evaluateRecursive(List<String> tokens, int tokenIndex, Field currentField,
            List<Field> results) {

        // 1. Basis: we zijn aan het einde van het pad
        if (tokenIndex >= tokens.size() - 1) {
            // if (token.equals(currentField.getName())) {
                results.add(currentField);
            // }
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
    private static void searchDeep(Field root, String targetName, List<String> tokens, int nextTokenIdx, List<Field> results) {
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

}
