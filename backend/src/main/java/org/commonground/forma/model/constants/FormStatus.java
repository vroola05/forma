package org.commonground.forma.model.constants;

import com.fasterxml.jackson.annotation.JsonCreator;
import java.util.stream.Stream;

public enum FormStatus {
    DRAFT, 
    ARCHIVED, 
    PENDING_DELETION, 
    PUBLISHED;

    @JsonCreator
    public static FormStatus fromString(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        
        return Stream.of(FormStatus.values())
                .filter(status -> status.name().equalsIgnoreCase(value.trim()))
                .findFirst()
                .orElse(null);
    }
}
