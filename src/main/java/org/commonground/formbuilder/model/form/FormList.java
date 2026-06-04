package org.commonground.formbuilder.model.form;

import java.util.UUID;

import org.commonground.formbuilder.model.constants.FormStatus;

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
public class FormList {
    UUID id;
    String name;
    String label;
    FormStatus status;
}
