package org.commonground.forma.database.dao.definition.properties;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

public record FileFieldProperties(
    String type,
    Boolean isMultiple,
    Long maxFiles,
    Long maxFileSize,
    List<String> allowedExtensions
) implements FieldProperties {

    @JsonCreator
    public FileFieldProperties(
        @JsonProperty("type") String type,
        @JsonProperty("isMultiple") Boolean isMultiple,
        @JsonProperty("maxFiles") Long maxFiles,
        @JsonProperty("maxFileSize") Long maxFileSize,
        @JsonProperty("allowedExtensions") List<String> allowedExtensions

    ) {
        this.type = type;
        this.isMultiple = isMultiple;
        this.maxFiles = maxFiles;
        this.maxFileSize = maxFileSize;
        this.allowedExtensions = allowedExtensions;
    }

    @Override
    public String getType() {
        return this.type;
    }
}




