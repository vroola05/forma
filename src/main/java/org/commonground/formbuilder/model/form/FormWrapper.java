package org.commonground.formbuilder.model.form;

import org.commonground.formbuilder.model.form.fields.Form;

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
