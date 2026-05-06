package org.commonground.formbuilder.services.editor;

import java.util.List;
import java.util.stream.Collectors;

import org.commonground.formbuilder.model.editor.TiptapNode;
import org.springframework.stereotype.Service;

@Service
public class TiptapService {
    public String convertToHtml(TiptapNode node) {
        if (node == null)
            return "";

        if ("text".equals(node.type)) {
            return applyMarks(node.text, node.marks);
        }

        // 2. Verwerk de inhoud van de node (recursie)
        String innerHtml = "";
        if (node.content != null) {
            innerHtml = node.content.stream()
                    .map(this::convertToHtml)
                    .collect(Collectors.joining());
        }

        // 3. Map type naar HTML tag
        return switch (node.type != null ? node.type : "") {
            case "doc" -> innerHtml;
            case "paragraph" -> "<p>" + innerHtml + "</p>";
            case "heading" -> {
                int level = (node.attrs != null) ? (int) node.attrs.getOrDefault("level", 1) : 1;
                yield "<h" + level + ">" + innerHtml + "</h" + level + ">";
            }
            case "bulletList" -> "<ul>" + innerHtml + "</ul>";
            case "orderedList" -> "<ol>" + innerHtml + "</ol>";
            case "listItem" -> "<li>" + innerHtml + "</li>";
            case "hardBreak" -> "<br>";
            default -> innerHtml;
        };
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
