package org.commonground.forma.model.editor;

import java.util.List;
import java.util.Map;

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
public class TiptapNode {
    private String type;
    private Map<String, Object> attrs;
    private List<TiptapNode> content;
    private List<TiptapMark> marks;
    private String text;

    public static class TiptapMark {
        public String type;
        public Map<String, Object> attrs;
    }
}
