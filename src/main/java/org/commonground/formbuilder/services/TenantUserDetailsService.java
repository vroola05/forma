package org.commonground.formbuilder.services;

import java.util.List;
import java.util.UUID;

import org.commonground.formbuilder.config.tenant.TenantContext;
import org.commonground.formbuilder.database.dao.settings.UserEntity;
import org.commonground.formbuilder.database.repository.UserRepository;
import org.commonground.formbuilder.model.UserDetailsExtended;
import org.commonground.formbuilder.model.settings.Tenant;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
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
        Tenant currentTenant = TenantContext.getTenant();

        UserEntity userEntity;
        if (currentTenant == null) {
            userEntity = userRepository.findByUsernameAndTenantIdIsNull(username)
                    .orElseThrow(() -> new UsernameNotFoundException("{user.error.not_found}"));
        } else {
            UUID tenantId = currentTenant.getId();
            userEntity = userRepository.findByUsernameAndTenantId(username, tenantId)
                    .orElseThrow(() -> new UsernameNotFoundException("{user.error.not_found}"));
        }

        List<SimpleGrantedAuthority> authorities = List.of(new SimpleGrantedAuthority(userEntity.getRole().toString()));

        UserDetailsExtended userDetails = new UserDetailsExtended(
                userEntity.getUsername(),
                userEntity.getPassword(),
                authorities,
                userEntity.getTenantId());

        return userDetails;
    }
}
