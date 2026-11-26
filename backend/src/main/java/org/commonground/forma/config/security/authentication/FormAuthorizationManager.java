package org.commonground.forma.config.security.authentication;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.function.Supplier;

import org.commonground.forma.database.dao.definition.FormDefinitionEntity;
import org.commonground.forma.database.dao.settings.TenantAuthProviderEntity;
import org.commonground.forma.database.dao.settings.TenantAuthProviderGroupEntity;
import org.commonground.forma.model.settings.Tenant;
import org.commonground.forma.model.settings.constants.Permissions;
import org.commonground.forma.services.TenantService;
import org.commonground.forma.services.form.FormService;
import org.jspecify.annotations.Nullable;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.authorization.AuthorizationDecision;
import org.springframework.security.authorization.AuthorizationManager;
import org.springframework.security.authorization.AuthorizationResult;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.web.access.intercept.RequestAuthorizationContext;
import org.springframework.stereotype.Component;



@Component
public class FormAuthorizationManager implements AuthorizationManager<RequestAuthorizationContext> {
    private final TenantService tenantService;
    private final FormService formService;

    public FormAuthorizationManager(
            TenantService tenantService,
            FormService formService) {
        this.tenantService = tenantService;
        this.formService = formService;
    }

    @Override
    public @Nullable AuthorizationResult authorize(Supplier<? extends @Nullable Authentication> authentication,
            RequestAuthorizationContext context) {
        
        Map<String, String> variables = context.getVariables();
        String tenantSlug = variables.get("tenantSlug");
        String formId = variables.get("formId");
        Tenant tenant = tenantService.get(tenantSlug);

        FormDefinitionEntity formDefinitionEntity = this.formService.getEntityWithAuthDetails(tenant.getId(), formId);
        
        if (formDefinitionEntity.isPublicAccess()) {
            return new AuthorizationDecision(true);
        }

        Authentication auth = authentication.get();
        if (auth == null || !auth.isAuthenticated() || auth instanceof AnonymousAuthenticationToken) {
            return new AuthorizationDecision(false);
        }

        if (formDefinitionEntity.isAllowFormLogin() && hasAuthority(auth, Permissions.FORM_FILL)) {
            return new AuthorizationDecision(true);
        }

        if (auth instanceof OAuth2AuthenticationToken oauthToken) {
            Set<TenantAuthProviderEntity> allowedProviders = formDefinitionEntity.getAllowedProviders();
            if (allowedProviders == null || allowedProviders.isEmpty()) {
                return new AuthorizationDecision(false);
            }

            String usedProviderId = oauthToken.getAuthorizedClientRegistrationId();
             Optional<TenantAuthProviderEntity> tenantAuthProviderEntityOptional = allowedProviders.stream()
                .filter(provider -> provider.getId().toString().equals(usedProviderId)).findFirst();

            if (tenantAuthProviderEntityOptional.isEmpty()) {
                return new AuthorizationDecision(false);
            }

            TenantAuthProviderEntity tenantAuthProviderEntity = tenantAuthProviderEntityOptional.get();
            Set<TenantAuthProviderGroupEntity> allowedGroups = tenantAuthProviderEntity.getGroupMapping(); // Pas aan naar jouw veldnaam
            
            if (allowedGroups == null || allowedGroups.isEmpty()) {
                return new AuthorizationDecision(true);
            }

            boolean isInAllowedGroup = false;
            if (oauthToken.getPrincipal() instanceof OidcUser oidcUser) {
                List<String> externalGroups = oidcUser.getClaimAsStringList("groups");
                if (externalGroups != null && !externalGroups.isEmpty()) {
                    isInAllowedGroup = allowedGroups.stream()
                        .anyMatch(group -> isInGroup(externalGroups, group.getExternalId()));
                }
            }

            return new AuthorizationDecision(isInAllowedGroup);
        }
        
        return new AuthorizationDecision(false);
    }

    public boolean isInGroup(List<String> groups, String group) {
        return groups == null ? false : groups.stream().anyMatch(g -> g != null && g.equals(group));
    }

    private boolean hasAuthority(Authentication auth, String expectedAuthority) {
        for (GrantedAuthority ga : auth.getAuthorities()) {
            System.out.println(ga.getAuthority() +" | "+ expectedAuthority);
            if (ga.getAuthority().equals(expectedAuthority)) {
                return true;
            }
        }
        return false;
    }
}

