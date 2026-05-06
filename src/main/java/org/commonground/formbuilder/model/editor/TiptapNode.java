package org.commonground.formbuilder.model.editor;

import java.util.List;
import java.util.Map;

public class TiptapNode {
    public String type;
    public Map<String, Object> attrs;
    public List<TiptapNode> content;
    public List<TiptapMark> marks;
    public String text;

    public static class TiptapMark {
        public String type;
        public Map<String, Object> attrs;
    }
}
