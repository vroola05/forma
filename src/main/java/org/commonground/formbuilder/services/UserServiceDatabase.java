package org.commonground.formbuilder.services;

import java.util.UUID;

import org.commonground.formbuilder.database.dao.settings.TenantUserEntity;
import org.commonground.formbuilder.database.repository.GroupRepository;
import org.commonground.formbuilder.database.repository.TenantUserRepository;
import org.commonground.formbuilder.mapper.UserMapper;
import org.commonground.formbuilder.model.constants.UserStatus;
import org.commonground.formbuilder.model.settings.User;
import org.commonground.formbuilder.model.settings.UserRegisterRequest;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@Transactional(readOnly = true)
public class UserServiceDatabase implements UserService {
    private final UserMapper userMapper;
    private final TenantUserRepository userRepository;
    private final GroupRepository groupRepository;
    private final PasswordEncoder passwordEncoder;

    UserServiceDatabase(
        UserMapper userMapper,
        TenantUserRepository userRepository,
        GroupRepository groupRepository,
        PasswordEncoder passwordEncoder) {

        this.userMapper = userMapper;
        this.userRepository = userRepository;
        this.groupRepository = groupRepository;
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
    @Transactional
    public User createUser(UUID tenantId, UserRegisterRequest userRegisterRequest) {
        if (userRepository.existsByUsernameAndTenantId(userRegisterRequest.getUsername(), tenantId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "{user.error.username_exists}");
        }

        TenantUserEntity userEntity = userMapper.toNewEntity(userRegisterRequest);
        userEntity.setId(UUID.randomUUID());

        if (userRegisterRequest.getPassword() != null) {
            userEntity.setPassword(passwordEncoder.encode(userRegisterRequest.getPassword()));
        }

        userEntity.setStatus(UserStatus.INVITED);
        userEntity.setTenantId(tenantId);

        // There must be at least one group
        if (userRegisterRequest.getGroups() != null && !userRegisterRequest.getGroups().isEmpty()) {
            groupRepository.findByTenantIdAndIdIn(tenantId, 
                userRegisterRequest.getGroups().stream().map(g -> g.getId()).toList())
                    .forEach(group -> userEntity.getGroups().add(group));
        }

        TenantUserEntity savedUser = userRepository.save(userEntity);

        
        return userMapper.toResponseDto(savedUser);

    }

    @Override
    @Transactional
    public User updateUser(UUID tenantId, User user) {
        if (user.getId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "{user.error.id_required}");
        }

        if (userRepository.existsByUsernameAndTenantIdAndIdNot(user.getUsername(), tenantId, user.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "{user.error.username_exists}");
        }

        TenantUserEntity existingUser = userRepository.findByIdAndTenantId(user.getId(), tenantId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "{tenant.error.not_found}"));

        userMapper.updateEntityFromDto(user, existingUser);

        TenantUserEntity savedUser = userRepository.save(existingUser);
        return userMapper.toResponseDto(savedUser);


    }

    
}
