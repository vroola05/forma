package org.commonground.formbuilder;

import java.util.UUID;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import lombok.Data;

@Data
@Component
@ConfigurationProperties(prefix = "app")
public class AppProperties {
    private AdminProperties admin = new AdminProperties();

    @Data
    public static class AdminProperties {
        private String username;
        private String email;
        private String password;
        private UUID globalAdminGroupId;
    }
}
