package org.commonground.forma.model.form;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

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

    public Set<UUID> getIncomingTabIds() {
        if (this.form == null || this.form.getFields() == null) {
            return Set.of();
        }

        Set<UUID> incomingIds = new HashSet<>();
        form.getFields().forEach(f -> {
            if (f.getId() != null) incomingIds.add(f.getId());
        });

        return incomingIds;
    }
}
