package org.commonground.formbuilder.model.settings;

import java.util.Set;
import java.util.UUID;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class GroupRegisterRequest {
    private UUID id;
    private String name;
    private Set<String> permissions;
}
