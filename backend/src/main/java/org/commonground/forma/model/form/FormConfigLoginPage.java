package org.commonground.forma.model.form;

import java.util.Set;
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
public class FormConfigLoginPage {
    private TiptapNode loginInstructions;
    private boolean publicAccess;
    private boolean allowFormLogin;
    private Set<UUID> providerIds;

}
