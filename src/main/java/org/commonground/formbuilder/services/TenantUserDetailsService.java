package org.commonground.formbuilder.services;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import org.commonground.formbuilder.config.tenant.TenantContext;
import org.commonground.formbuilder.database.dao.settings.PermissionEntity;
import org.commonground.formbuilder.database.dao.settings.GroupEntity;
import org.commonground.formbuilder.database.dao.settings.TenantUserEntity;
import org.commonground.formbuilder.database.repository.TenantUserRepository;
import org.commonground.formbuilder.mapper.GroupMapper;
import org.commonground.formbuilder.model.settings.Group;
import org.commonground.formbuilder.model.settings.Tenant;
import org.commonground.formbuilder.model.settings.UserDetailsExtended;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import jakarta.servlet.http.HttpServletRequest;

@Service
public class TenantUserDetailsService implements UserDetailsService {

    private final TenantService tenantService;
    private final TenantUserRepository userRepository;
    private final GroupMapper groupMapper;
    private final AntPathMatcher pathMatcher = new AntPathMatcher();

    @Value("${app.admin.global-admin-group-id}")
    private UUID globalAdminGroupId;

    public TenantUserDetailsService(TenantService tenantService, TenantUserRepository userRepository,
        GroupMapper groupMapper
    ) {
        this.tenantService = tenantService;
        this.userRepository = userRepository;
        this.groupMapper = groupMapper;
    }


    /**
     * This method sets the tenant context based on the tenantSlug extracted from the incoming request's URI.
     * It uses Spring's RequestContextHolder to access the current HTTP request and AntPathMatcher
     * to match the URI against a predefined pattern that includes the tenantSlug. If a tenantSlug is found and is not "system",
     * it retrieves the corresponding tenant from the TenantService and sets it in the TenantContext.
     * 
     * This approach allows the loadUserByUsername method to operate with the correct tenant context,
     * enabling tenant-specific user retrieval logic.
     */
    public void setTenantSlug() {
        
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();

        if (attributes != null) {
            HttpServletRequest request = attributes.getRequest();
            String path = request.getRequestURI();
            
            
            String loginPattern = "/{tenantSlug}/api/login";
            
            if (pathMatcher.match(loginPattern, path)) {
                Map<String, String> variabelen = pathMatcher.extractUriTemplateVariables(loginPattern, path);
                String tenantSlug = variabelen.get("tenantSlug");
                if (tenantSlug != null) {
                    
                    TenantContext.setTenant(this.tenantService.get(tenantSlug));
                    
                    return;
                }
            }
        }
        throw new UsernameNotFoundException("{tenant.error.not_found}");
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        setTenantSlug();
        Tenant currentTenant = TenantContext.getTenant();

        TenantUserEntity userEntity;
        if (currentTenant == null || currentTenant.getId() == null) {
            userEntity = userRepository.findByUsernameAndTenantIdIsNullWithGroupsAndPermissions(username)
                    .orElseThrow(() -> new UsernameNotFoundException("{user.error.not_found}"));

            // The global admin user must be part of the global admin group, otherwise they should not be able to log in
            if (!userEntity.getGroups().stream().anyMatch(group -> group.getId().equals(globalAdminGroupId))) {
                throw new UsernameNotFoundException("{user.error.not_found}");
            }
                    
        } else {
            UUID tenantId = currentTenant.getId();
            userEntity = userRepository.findByUsernameAndTenantIdWithGroupsAndPermissions(username, tenantId)
                    .orElseThrow(() -> new UsernameNotFoundException("{user.error.not_found}"));
        }
        
        List<SimpleGrantedAuthority> authorities = new ArrayList<>();
        
        Set<String> permissions = new HashSet<>();
        Set<Group> groups = new HashSet<>();

        for (GroupEntity group : userEntity.getGroups()) {
            groups.add(groupMapper.toResponseDto(group));

            for (PermissionEntity permission : group.getPermissions()) {
                authorities.add(new SimpleGrantedAuthority(permission.getId()));
                permissions.add(permission.getId());
            }
        }

        System.out.println("User " + username + " has permissions: " + permissions);
        
        UserDetailsExtended userDetails = new UserDetailsExtended(
                userEntity.getUsername(),
                userEntity.getPassword(),
                authorities,
                userEntity,
                groups,
                permissions);

            System.out.println("Loaded user: " + userDetails.getUsername() + " with authorities: " );
        return userDetails;
    }
}
