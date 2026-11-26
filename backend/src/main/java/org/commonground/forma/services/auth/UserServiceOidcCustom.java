package org.commonground.forma.services.auth;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import org.commonground.forma.config.tenant.TenantContext;
import org.commonground.forma.database.dao.settings.GroupEntity;
import org.commonground.forma.database.dao.settings.PermissionEntity;
import org.commonground.forma.database.dao.settings.TenantAuthProviderEntity;
import org.commonground.forma.database.dao.settings.TenantAuthProviderGroupEntity;
import org.commonground.forma.database.repository.TenantAuthProviderRepository;
import org.commonground.forma.mapper.GroupMapper;
import org.commonground.forma.model.settings.Group;
import org.commonground.forma.model.settings.Tenant;
import org.commonground.forma.model.settings.UserOidcExtended;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserServiceOidcCustom extends OidcUserService {

    private final TenantAuthProviderRepository authProviderRepository;
    private final GroupMapper groupMapper;

    @Override
    @Transactional(readOnly = true)
    public OidcUser loadUser(OidcUserRequest userRequest) throws OAuth2AuthenticationException {
        OidcUser oidcUser = super.loadUser(userRequest);

        Tenant currentTenant = TenantContext.getTenant();
        if (currentTenant == null || currentTenant.getId() == null) {
            throw new OAuth2AuthenticationException(new OAuth2Error("invalid_tenant", "Geen tenant context", null));
        }

        UUID tenantId = currentTenant.getId();
        UUID authProviderId = UUID.fromString(userRequest.getClientRegistration().getRegistrationId());

        TenantAuthProviderEntity provider = authProviderRepository
                .findByTenantIdAndId(tenantId, authProviderId)
                .orElseThrow(() -> new OAuth2AuthenticationException(
                        new OAuth2Error("invalid_provider", "Provider hoort niet bij deze tenant", null)
                ));

        List<String> externalGroupIds = oidcUser.getClaimAsStringList("groups");
        
        Set<GrantedAuthority> authorities = new HashSet<>(oidcUser.getAuthorities());
        Set<String> permissions = new HashSet<>();
        Set<Group> groups = new HashSet<>();

        if (externalGroupIds != null && !externalGroupIds.isEmpty()) {
            for (TenantAuthProviderGroupEntity mapping : provider.getGroupMapping()) {
                if (externalGroupIds.contains(mapping.getExternalId())) {
                    GroupEntity groupEntity = mapping.getGroup();
                    groups.add(groupMapper.toResponseDto(groupEntity));

                    for (PermissionEntity permission : groupEntity.getPermissions()) {
                        authorities.add(new SimpleGrantedAuthority(permission.getId()));
                        permissions.add(permission.getId());
                    }
                }
            }
        }

        String username = oidcUser.getEmail() != null ? oidcUser.getEmail() : oidcUser.getPreferredUsername();

        return new UserOidcExtended(
                oidcUser,
                authorities,
                tenantId,
                username,
                oidcUser.getEmail(),
                oidcUser.getFullName(),
                groups,
                permissions
        );
    }
}