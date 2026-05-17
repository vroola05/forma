package org.commonground.formbuilder.services;

import java.util.UUID;

import org.commonground.formbuilder.config.tenant.TenantContext;
import org.commonground.formbuilder.database.dao.settings.UserEntity;
import org.commonground.formbuilder.database.repository.UserRepository;
import org.commonground.formbuilder.model.settings.Tenant;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class TenantUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        System.out.println("Ik kom hieeer1");
        Tenant currentTenant = TenantContext.getTenant();

        System.out.println("Ik kom hieeer");
        UserEntity userEntity;
        if (currentTenant == null) {
            userEntity = userRepository.findByUsernameAndTenantIdIsNull(username)
                .orElseThrow(() -> new UsernameNotFoundException("Global admin niet gevonden"));
        } else {
            UUID tenantId = currentTenant.getId(); 

            userEntity = userRepository.findByUsernameAndTenantId(username, tenantId)
                .orElseThrow(() -> new UsernameNotFoundException("Gebruiker niet gevonden in tenant"));
        }

        System.out.println("Ik kom: " + userEntity.getUsername() + " " + userEntity.getPassword());
        UserDetails userDetails = org.springframework.security.core.userdetails.User.builder()
            .username(userEntity.getUsername())
            .password(userEntity.getPassword())
            .authorities(userEntity.getRole().toString())
            .build();

        System.out.println("Ik kom: " + userDetails.getUsername() + " " + userDetails.getPassword());
            
        return userDetails;
    }
}
