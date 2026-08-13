package org.commonground.forma.util.condition;

import java.util.ArrayList;
import java.util.List;

public class JsonPathTokenizer {
    public static final int MAX_DEPTH = 10;

    public static List<String> tokenize(char[] input) {
        List<String> output = new ArrayList<>();
        StringBuilder token = new StringBuilder();
        int bracketLevel = 0;

        for (int i = 0; i < input.length; i++) {
            char c = input[i];

            if (bracketLevel > 0) {
                // LOGICA BINNEN DE HAKEN [ ... ]
                if (c == ']') {
                    String content = token.toString();
                    // Validatie: mag alleen cijfers, '*' of ':' bevatten
                    if (content.equals("*") || content.matches("\\d+") || content.matches("\\d*:\\d+")) {
                        output.add("[" + content + "]");
                        token.setLength(0);
                        bracketLevel--;
                    } else {
                        throw new RuntimeException("Syntax fout: Ongeldige index of slice '" + content + "' op positie " + i);
                    }
                } else if (Character.isDigit(c) || c == ':' || c == '*') {
                    token.append(c);
                } else {
                    throw new RuntimeException("Syntax fout: Karakter '" + c + "' niet toegestaan binnen haken op positie " + i);
                }
            } else {
                // LOGICA BUITEN DE HAKEN (Veldnamen en operators)
                if (c == '.') {
                    // Check of we een veldnaam afsluiten
                    handlePendingToken(token, output, i);

                    // Check op ".." (Deep Scan)
                    if (i + 1 < input.length && input[i + 1] == '.') {
                        output.add("..");
                        i++; // Sla de tweede punt over
                    }
                } else if (c == '[') {
                    // Check of de veldnaam voor de '[' niet ongeldig eindigt, bijv. "veld-"
                    handlePendingToken(token, output, i);
                    bracketLevel++;
                } else if (c == ']') {
                    throw new RuntimeException("Syntax fout: Sluitende haak ']' zonder opening op positie " + i);
                } else if (Character.isLetterOrDigit(c) || c == '_' || c == '-' || c == '$') {
                    token.append(c);
                } else if (Character.isWhitespace(c)) {
                    // Sla spaties over of gooi een error afhankelijk van je voorkeur
                } else {
                    throw new RuntimeException("Syntax fout: Karakter '" + c + "' niet toegestaan in veldnaam op positie " + i);
                }
            }
        }

        if (output.size() > MAX_DEPTH) {
            throw new RuntimeException("Limiet fout: er is een maximum diepte van "+ MAX_DEPTH +".");
        }

        // Final check
        if (bracketLevel > 0) {
            throw new RuntimeException("Syntax fout: Niet alle haken zijn gesloten.");
        }
        
        handlePendingToken(token, output, input.length);

        return output;
    }

    private static void handlePendingToken(StringBuilder token, List<String> output, int pos) {
        if (token.length() > 0) {
            String val = token.toString();
            // Fout: $.veld- (mag niet eindigen op een koppelteken voor een separator)
            if (val.endsWith("-")) {
                throw new RuntimeException("Syntax fout: Veldnaam mag niet eindigen op '-' op positie " + pos);
            }
            output.add(val);
            token.setLength(0);
        }
    }

}
