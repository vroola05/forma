package org.commonground.forma.config;

import java.util.Map;
import java.util.function.Supplier;

import org.commonground.forma.database.dao.definition.FormDefinitionEntity;
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

        FormDefinitionEntity formDefinitionEntity = this.formService.getEntity(tenant.getId(), formId);
        
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
        
        return new AuthorizationDecision(false);
    }

    private boolean hasAuthority(Authentication auth, String expectedAuthority) {
        return auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals(expectedAuthority));
    }
}

