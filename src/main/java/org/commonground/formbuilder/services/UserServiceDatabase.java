package org.commonground.formbuilder.services;

import java.util.UUID;

import org.commonground.formbuilder.database.dao.settings.UserEntity;
import org.commonground.formbuilder.database.repository.UserRepository;
import org.commonground.formbuilder.mapper.UserMapper;
import org.commonground.formbuilder.model.settings.User;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class UserServiceDatabase implements UserService {
    private final UserMapper userMapper;
    private final UserRepository userRepository;
    private final SecurityService securityService;

    UserServiceDatabase(
        SecurityService securityService,
        UserMapper userMapper,
        UserRepository userRepository) {

        this.userMapper = userMapper;
        this.userRepository = userRepository;
        this.securityService = securityService;
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
        // securityService.getUserTenantId()
        if (user.getId() == null) {
            UserEntity userEntity = userMapper.toNewEntity(user);
            
        }
        return userMapper.toResponseDto(null);
    }

    
}
