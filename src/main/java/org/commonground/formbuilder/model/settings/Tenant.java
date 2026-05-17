package org.commonground.formbuilder.model.settings;

import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class Tenant {
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private UUID id;
    private String slug;
    private String name;
    private String logoUrl;
    private String homePage;
    private boolean active;
    private String contactEmail;
}
