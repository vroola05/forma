package org.commonground.forma.config.security.oauth;

import java.util.Arrays;
import java.util.UUID;

import org.commonground.forma.database.dao.settings.TenantAuthProviderEntity;
import org.commonground.forma.database.repository.TenantAuthProviderRepository;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.registration.ClientRegistrations;
import org.springframework.stereotype.Component;

@Component
public class DatabaseClientRegistrationRepository implements ClientRegistrationRepository {

    private final TenantAuthProviderRepository providerRepository;

    public DatabaseClientRegistrationRepository(TenantAuthProviderRepository providerRepository) {
        this.providerRepository = providerRepository;
    }

    @Override
    public ClientRegistration findByRegistrationId(String registrationId) {
        UUID providerId;
        try {
            System.out.println("DatabaseClientRegistrationRepository - findByRegistrationId");
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
        System.out.println("DatabaseClientRegistrationRepository - toClientRegistration");
        // Splits de komma-gescheiden scopes uit je database ("openid,profile,email")
        String[] scopes = Arrays.stream(entity.getScopes().split(","))
                .map(String::trim)
                .toArray(String[]::new);

        // ClientRegistrations.fromIssuerLocation haalt automatisch de endpoints op
        // via {issuerUri}/.well-known/openid-configuration (werkt standaard voor Microsoft!)
        return ClientRegistrations.fromIssuerLocation(entity.getIssuerUri())
                .registrationId(entity.getId().toString())
                .clientId(entity.getClientId())
                .clientSecret(entity.getClientSecret())
                .scope(scopes)
                .build();
    }
}
