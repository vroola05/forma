package org.commonground.forma.model.submission;

import java.util.UUID;

import org.commonground.forma.model.form.fields.Form;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class Submission {
    private UUID id;
    private UUID formDefinitionId;
    private String formName;
    private Long formVersion;

    private Form form;

}
