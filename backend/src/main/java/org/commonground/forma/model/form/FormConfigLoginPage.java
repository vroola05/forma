package org.commonground.forma.model.form;

import java.util.HashSet;
import java.util.Set;

import org.commonground.forma.model.editor.TiptapNode;
import org.commonground.forma.model.form.idp.FormAuthProvider;

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
public class FormConfigLoginPage {
    private TiptapNode loginInstructions;
    private boolean publicAccess;
    private boolean allowFormLogin;
    private Set<FormAuthProvider> formAuthProvider = new HashSet<>();

}
