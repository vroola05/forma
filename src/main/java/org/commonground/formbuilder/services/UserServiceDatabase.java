package org.commonground.formbuilder.services;

import java.util.UUID;

import org.commonground.formbuilder.database.dao.settings.UserEntity;
import org.commonground.formbuilder.database.repository.UserRepository;
import org.commonground.formbuilder.mapper.UserMapper;
import org.commonground.formbuilder.model.settings.User;
import org.commonground.formbuilder.model.settings.UserRole;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class UserServiceDatabase implements UserService {
    private final UserMapper userMapper;
    private final UserRepository userRepository;
    private final SecurityService securityService;
    private final PasswordEncoder passwordEncoder;

    UserServiceDatabase(
        SecurityService securityService,
        UserMapper userMapper,
        UserRepository userRepository,
        PasswordEncoder passwordEncoder) {

        this.userMapper = userMapper;
        this.userRepository = userRepository;
        this.securityService = securityService;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public User getByUsername(UUID tenantId, String username) {
        return userMapper.toResponseDto(userRepository.findByUsernameAndTenantId(username, tenantId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "{tenant.error.not_found}")));
    }

    @Override
    public User get(UUID tenantId, UUID id) {
        return userMapper.toResponseDto(userRepository.findByIdAndTenantId(id, tenantId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "{tenant.error.not_found}")));
    }

    @Override
    public User save(UUID tenantId, User user) {
        if (!securityService.hasRole(UserRole.ROLE_GLOBAL_ADMIN)) {
            securityService.validateAccessToTenant(tenantId);
        }
        

        if (user.getId() == null) {
            UserEntity userEntity = userMapper.toNewEntity(user);
            userEntity.setId(UUID.randomUUID());
            if (user.getPassword() != null) {
                userEntity.setPassword(passwordEncoder.encode(user.getPassword()));
            }
            userEntity.setTenantId(tenantId);
            return userMapper.toResponseDto(userRepository.save(userEntity));
        } else {
            UserEntity existingUser = userRepository.findByIdAndTenantId(user.getId(), tenantId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "{tenant.error.not_found}"));
            userMapper.updateEntityFromDto(user, existingUser);
            if (user.getPassword() != null) {
                existingUser.setPassword(passwordEncoder.encode(user.getPassword()));
            }
            return userMapper.toResponseDto(userRepository.save(existingUser));
        }

    }

    
}
