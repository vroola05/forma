package org.commonground.forma.config.security.authentication.oauth;

import java.util.Arrays;
import java.util.UUID;

import org.commonground.forma.config.tenant.TenantContext;
import org.commonground.forma.database.dao.settings.TenantAuthProviderEntity;
import org.commonground.forma.database.repository.TenantAuthProviderRepository;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.registration.ClientRegistrations;
import org.springframework.stereotype.Component;

@Component
public class DatabaseClientRegistrationRepository implements ClientRegistrationRepository {

    private final TenantAuthProviderRepository providerRepository;

    public DatabaseClientRegistrationRepository(
            TenantAuthProviderRepository providerRepository) {
        this.providerRepository = providerRepository;

    }

    @Override
    public ClientRegistration findByRegistrationId(String registrationId) {
        UUID providerId;
        try {
            providerId = UUID.fromString(registrationId);
        } catch (IllegalArgumentException e) {
            return null;
        }

        return providerRepository.findById(providerId)
                .filter(TenantAuthProviderEntity::isActive)
                .map(this::toClientRegistration)
                .orElse(null);
    }

    private ClientRegistration toClientRegistration(TenantAuthProviderEntity entity) {
        String tenantSlug = TenantContext.getTenant().getSlug();
        
        String rawScopes = entity.getScopes();

        String[] scopes = (rawScopes == null || rawScopes.isBlank())
                ? new String[0]
                : Arrays.stream(rawScopes.split("[\\s,]+"))
                        .map(String::trim)
                        .filter(s -> !s.isEmpty())
                        .toArray(String[]::new);

        return ClientRegistrations.fromIssuerLocation(entity.getIssuerUri())
                .registrationId(entity.getId().toString())
                .clientId(entity.getClientId())
                .clientSecret(entity.getClientSecret())
                .redirectUri("{baseUrl}/" + tenantSlug + "/login/oauth2/code/{registrationId}")
                .scope(scopes)
                .build();
    }
}
