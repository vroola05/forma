package org.commonground.forma.config.security;

import java.util.UUID;

import org.commonground.forma.database.dao.settings.UserEntity;
import org.commonground.forma.database.repository.GroupRepository;
import org.commonground.forma.database.repository.TenantUserRepository;
import org.commonground.forma.model.constants.UserStatus;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class GlobalAdminInitializer implements CommandLineRunner {
    private final TenantUserRepository userRepository;
    private final GroupRepository groupRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.global-admin-group-id}")
    private UUID globalAdminGroupId;

    @Value("${app.admin.username}")
    private String adminUsername;

    @Value("${app.admin.email}")
    private String adminEmail;

    @Value("${app.admin.password}")
    private String adminPassword;

    public GlobalAdminInitializer(TenantUserRepository userRepository, GroupRepository groupRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.groupRepository = groupRepository;
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
            admin.setName("Global Admin");
            admin.setStatus(UserStatus.ACTIVE);
            admin.setTenantId(null);

            this.groupRepository.findById(globalAdminGroupId).ifPresentOrElse(group -> {
                admin.getGroups().add(group);
            }, () -> {
                throw new RuntimeException("Global admin group not found");
            });
            // 
            
            
            userRepository.save(admin);
            System.out.println("Global admin aangemaakt met gebruikersnaam: " + adminUsername);
        }
    }
}
