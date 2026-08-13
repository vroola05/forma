package org.commonground.forma.model.form;

import org.commonground.forma.model.form.fields.Form;

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
public class FormWrapper {
    boolean active;
    String fileName;
    FormConfig formConfig;
    Form form;
}
