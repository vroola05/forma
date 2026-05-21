package org.commonground.formbuilder.config.security;

import java.util.UUID;

import org.commonground.formbuilder.database.dao.settings.UserEntity;
import org.commonground.formbuilder.database.repository.UserRepository;
import org.commonground.formbuilder.model.settings.UserRole;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class GlobalAdminInitializer implements CommandLineRunner {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.username}")
    private String adminUsername;

    @Value("${app.admin.email}")
    private String adminEmail;

    @Value("${app.admin.password}")
    private String adminPassword;

    public GlobalAdminInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (userRepository.findByUsernameAndTenantId(adminUsername, null).isEmpty()) {
            UserEntity admin = new UserEntity();
            admin.setId(UUID.randomUUID());
            admin.setUsername(adminUsername);
            admin.setEmail(adminEmail);
            admin.setPassword(passwordEncoder.encode(adminPassword));
            admin.setRole(UserRole.ROLE_GLOBAL_ADMIN);
            admin.setTenantId(null);
            
            userRepository.save(admin);
            System.out.println("Global admin aangemaakt met gebruikersnaam: " + adminUsername);
        }
    }
}
