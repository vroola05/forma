package org.commonground.forma.services.editor;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.commonground.forma.model.editor.TiptapNode;
import org.commonground.forma.model.form.Variable;
import org.commonground.forma.model.form.fields.Form;
import org.commonground.forma.util.condition.JsonPathFinder;
import org.springframework.stereotype.Service;


@Service
public class TiptapService {

    private static final Set<String> MENTIONS = Set.of("page-variable-mention", "form-field-mention");

    public String convert(TiptapNode node, Form form, List<Variable> pageVariables) {
        String output = convertToHtml(node, form);
        output = convertPageVariables(output, form, pageVariables);
        

        return "<div class=\"template-container\">" + output + "</div>";
    }

    private String convertPageVariables(String input, Form form, List<Variable> pageVariables) {
        if (pageVariables == null) {
            pageVariables = new ArrayList<>();
        }

        return JsonPathFinder.evalText(input, form, pageVariables);
    } 

    private String convertToHtml(TiptapNode node, Form form) {
        if (node == null)
            return "";

        if ("text".equals(node.getType())) {
            return applyMarks(node.getText(), node.getMarks());
        }

        if (MENTIONS.contains(node.getType())) {
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
            String innerWord = (String) node.getAttrs().get("id");
            if (mentionKey == null || innerWord == null)
                return "";
            return mentionKey + innerWord;
        }
        
        return "";
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
