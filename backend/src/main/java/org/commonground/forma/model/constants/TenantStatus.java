package org.commonground.forma.model.constants;

import com.fasterxml.jackson.annotation.JsonCreator;
import java.util.stream.Stream;

public enum TenantStatus {
    ACTIVE,
    SUSPENDED,
    PENDING_DELETION;

    @JsonCreator
    public static TenantStatus fromString(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        
        return Stream.of(TenantStatus.values())
                .filter(tenant -> tenant.name().equalsIgnoreCase(value.trim()))
                .findFirst()
                .orElse(null);
    }
}
