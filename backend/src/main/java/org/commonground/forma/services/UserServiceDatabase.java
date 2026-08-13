package org.commonground.forma.services;

import java.util.List;
import java.util.Set;
import java.util.UUID;

import org.commonground.forma.database.dao.settings.GroupEntity;
import org.commonground.forma.database.dao.settings.UserEntity;
import org.commonground.forma.database.repository.GroupRepository;
import org.commonground.forma.database.repository.TenantUserRepository;
import org.commonground.forma.mapper.GroupMapper;
import org.commonground.forma.mapper.UserMapper;
import org.commonground.forma.model.constants.UserStatus;
import org.commonground.forma.model.settings.User;
import org.commonground.forma.model.settings.UserRegisterRequest;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@Transactional(readOnly = true)
public class UserServiceDatabase implements UserService {
    private final UserMapper userMapper;
    private final GroupMapper groupMapper;
    private final TenantUserRepository userRepository;
    private final GroupRepository groupRepository;
    private final PasswordEncoder passwordEncoder;

    UserServiceDatabase(
        UserMapper userMapper,
        GroupMapper groupMapper,
        TenantUserRepository userRepository,
        GroupRepository groupRepository,
        PasswordEncoder passwordEncoder) {

        this.userMapper = userMapper;
        this.groupMapper = groupMapper;
        this.userRepository = userRepository;
        this.groupRepository = groupRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public List<User> getAll(UUID tenantId) {
        return userMapper.toResponseDtoList(this.userRepository.findAllByTenantIdOrderByNameAsc(tenantId));
    }

    @Override
    public User getByUsername(UUID tenantId, String username) {
        return userMapper.toResponseDto(userRepository.findByUsernameAndTenantId(username, tenantId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "{tenant.error.not_found}")));
    }

    @Override
    public User get(UUID tenantId, UUID id) {
        UserEntity userEntity = userRepository.findByIdAndTenantId(id, tenantId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "{tenant.error.not_found}"));
        
        Set<GroupEntity> groupEntities = userEntity.getGroups();

        User user = userMapper.toResponseDto(userEntity);
        user.setGroups(groupMapper.toResponseDtoList(groupEntities));

        return user;
    }

    @Override
    @Transactional
    public User createUser(UUID tenantId, UserRegisterRequest userRegisterRequest) {
        if (userRepository.existsByUsernameAndTenantId(userRegisterRequest.getUsername(), tenantId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "{user.error.username_exists}");
        }

        UserEntity userEntity = userMapper.toNewEntity(userRegisterRequest);
        userEntity.setId(UUID.randomUUID());

        if (userRegisterRequest.getPassword() != null && !userRegisterRequest.getPassword().isEmpty()) {
            userEntity.setPassword(passwordEncoder.encode(userRegisterRequest.getPassword()));
        }

        userEntity.setStatus(UserStatus.INVITED);
        userEntity.setTenantId(tenantId);

        // There must be at least one group
        if (userRegisterRequest.getGroups() != null && !userRegisterRequest.getGroups().isEmpty()) {
            groupRepository.findByTenantIdAndIdInOrderByNameAsc(tenantId, 
                userRegisterRequest.getGroups().stream().map(g -> g.getId()).toList())
                    .forEach(group -> userEntity.getGroups().add(group));
        }

        UserEntity savedUser = userRepository.save(userEntity);

        
        return userMapper.toResponseDto(savedUser);

    }

    @Override
    @Transactional
    public User updateUser(UUID tenantId, UserRegisterRequest userRegisterRequest) {
        if (userRegisterRequest.getId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "{user.error.id_required}");
        }

        if (userRepository.existsByUsernameAndTenantIdAndIdNot(userRegisterRequest.getUsername(), tenantId, userRegisterRequest.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "{user.error.username_exists}");
        }

        UserEntity existingUser = userRepository.findByIdAndTenantId(userRegisterRequest.getId(), tenantId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "{tenant.error.not_found}"));

        userMapper.updateEntityFromDto(userRegisterRequest, existingUser);

        if (userRegisterRequest.getPassword() != null && !userRegisterRequest.getPassword().isEmpty()) {
            userRegisterRequest.setPassword(passwordEncoder.encode(userRegisterRequest.getPassword()));
        }

        UserEntity savedUser = userRepository.save(existingUser);
        return userMapper.toResponseDto(savedUser);


    }
}
