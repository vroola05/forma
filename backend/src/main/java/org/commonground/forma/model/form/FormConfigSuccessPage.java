package org.commonground.forma.model.form;

import java.util.UUID;

import org.commonground.forma.model.editor.TiptapNode;

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
public class FormConfigSuccessPage {
    private UUID id;
    private String name;
    private String title;
    private TiptapNode template;
    private String content;
    private Boolean showSummary;

}
