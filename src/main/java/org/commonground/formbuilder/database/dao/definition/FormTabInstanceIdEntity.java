package org.commonground.formbuilder.database.dao.definition;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FormTabInstanceIdEntity {
    private UUID form;
    private UUID tab;
}
