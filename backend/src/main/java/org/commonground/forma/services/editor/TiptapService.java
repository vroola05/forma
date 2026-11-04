package org.commonground.forma.services.editor;

import java.util.List;
import java.util.Optional;
import java.util.regex.MatchResult;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import org.commonground.forma.model.editor.TiptapNode;
import org.commonground.forma.model.form.Variable;
import org.commonground.forma.model.form.VariableValue;
import org.commonground.forma.model.form.fields.Form;
import org.commonground.forma.util.RegexConstants;
import org.commonground.forma.util.condition.JsonPathFinder;
import org.springframework.stereotype.Service;


@Service
public class TiptapService {
    public String convert(TiptapNode node, Form form, List<Variable> pageVariables) {
        String output = convertToHtml(node, form);

        output = convertPageVariables(output, form, pageVariables);
        
        return "<div class=\"template-container\">" + output + "</div>";
    }

    private String convertPageVariables(String input, Form form, List<Variable> pageVariables) {
        if (pageVariables == null || pageVariables.isEmpty()) {
            return input;
        }

        Pattern pattern = RegexConstants.PAGE_VAR;
        Matcher matcher = pattern.matcher(input);

        List<MatchResult> matches = matcher.results().collect(Collectors.toList());

        StringBuilder output = new StringBuilder(input);

        for (int i = matches.size() - 1; i >= 0; i--) {
            MatchResult match = matches.get(i);
            String var = match.group(2);

            Optional<Variable> variableOptional = pageVariables.stream().filter(variable -> variable.getName().equals(var)).findFirst();
            if (variableOptional.isEmpty()) {
                continue;
            }

            Variable variable = variableOptional.get();
            if( variable.getValues() == null || variable.getValues().isEmpty()) {
                continue;
            }

            VariableValue variableValue = variable.getValues().get(0);
            
            String value = variableValue.getValue();

            

            if (value.startsWith("#.")) {
            } else if (value.startsWith("$.")) {
                List<String> formVar = JsonPathFinder.evalTokenized(value, form);
                value = String.join(", ", formVar);
            }

            output.replace(match.start(), match.end(), value);
            
        }
        return output.toString();
    } 


    private String convertToHtml(TiptapNode node, Form form) {
        if (node == null)
            return "";

        if ("text".equals(node.getType())) {
            return applyMarks(node.getText(), node.getMarks());
        }

        if ("mention".equals(node.getType())) {
            return applyMention(node, form);
        }

        String innerHtml = "";
        if (node.getContent() != null) {
            innerHtml = node.getContent().stream()
                    .map(content -> convertToHtml(content, form))
                    .collect(Collectors.joining());
        }

        return switch (node.getType() != null ? node.getType() : "") {
            case "doc" -> innerHtml;
            case "paragraph" -> "<p>" + innerHtml + "</p>";
            case "heading" -> {
                int level = (node.getAttrs() != null) ? (int) node.getAttrs().getOrDefault("level", 1) : 1;
                yield "<h" + level + ">" + innerHtml + "</h" + level + ">";
            }
            case "bulletList" -> "<ul>" + innerHtml + "</ul>";
            case "orderedList" -> "<ol>" + innerHtml + "</ol>";
            case "listItem" -> "<li>" + innerHtml + "</li>";
            case "table" -> "<table>" + innerHtml + "</table>";
            case "tableRow" -> "<tr>" + innerHtml + "</tr>";
            case "tableCell" -> "<td>" + innerHtml + "</td>";
            case "tableHeader" -> "<th>" + innerHtml + "</th>";
            case "hardBreak" -> "<br>";
            default -> innerHtml;
        };
    }

    private String applyMention(TiptapNode node, Form form) {
        if (node.getAttrs().containsKey("mentionSuggestionChar")) {
            String mentionKey = (String) node.getAttrs().get("mentionSuggestionChar");

            return switch (mentionKey) {
                case "$" -> applyDollarMention((String) node.getAttrs().get("id"), form);
                default -> "";
            };
        }
        
        return "";
    }

    private String applyDollarMention(String input, Form form) {
        input = input.replace("{", "$.").replace("}", "");
        List<String> output = JsonPathFinder.evalTokenized(input, form);

        
        return String.join(", ", output);
    }

    private String applyMarks(String text, List<TiptapNode.TiptapMark> marks) {
        if (marks == null || text == null)
            return text;
        String result = text;
        for (TiptapNode.TiptapMark mark : marks) {
            result = switch (mark.type) {
                case "bold" -> "<strong>" + result + "</strong>";
                case "italic" -> "<em>" + result + "</em>";
                case "strike" -> "<s>" + result + "</s>";
                case "link" -> "<a href=\"" + mark.attrs.get("href") + "\">" + result + "</a>";
                default -> result;
            };
        }
        return result;
    }

}
