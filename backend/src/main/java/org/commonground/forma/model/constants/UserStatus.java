package org.commonground.forma.model.constants;

import com.fasterxml.jackson.annotation.JsonCreator;
import java.util.stream.Stream;

public enum UserStatus {
    INVITED,
    ACTIVE,
    BLOCKED,
    PENDING_DELETION;

    @JsonCreator
    public static UserStatus fromString(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        
        return Stream.of(UserStatus.values())
                .filter(user -> user.name().equalsIgnoreCase(value.trim()))
                .findFirst()
                .orElse(null);
    }
}
