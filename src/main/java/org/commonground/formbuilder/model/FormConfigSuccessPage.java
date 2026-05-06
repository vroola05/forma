package org.commonground.formbuilder.model;

import org.commonground.formbuilder.model.editor.TiptapNode;

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
    TiptapNode mailTemplate;
}
