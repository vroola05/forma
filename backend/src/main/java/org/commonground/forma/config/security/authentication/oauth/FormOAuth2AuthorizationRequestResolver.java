package org.commonground.forma.config.security.authentication.oauth;

import java.nio.charset.StandardCharsets;
import java.util.Base64;

import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.web.DefaultOAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;

import jakarta.servlet.http.HttpServletRequest;

public class FormOAuth2AuthorizationRequestResolver implements OAuth2AuthorizationRequestResolver {

    private final OAuth2AuthorizationRequestResolver defaultResolver;

    public FormOAuth2AuthorizationRequestResolver(ClientRegistrationRepository repo, String authorizationRequestBaseUri) {
        this.defaultResolver = new DefaultOAuth2AuthorizationRequestResolver(repo, authorizationRequestBaseUri);
    }

    @Override
    public OAuth2AuthorizationRequest resolve(HttpServletRequest request) {
        OAuth2AuthorizationRequest req = defaultResolver.resolve(request);
        return customizeState(req, request);
    }

    @Override
    public OAuth2AuthorizationRequest resolve(HttpServletRequest request, String clientRegistrationId) {
        OAuth2AuthorizationRequest req = defaultResolver.resolve(request, clientRegistrationId);
        return customizeState(req, request);
    }

    private OAuth2AuthorizationRequest customizeState(OAuth2AuthorizationRequest req, HttpServletRequest request) {
        if (req == null) {
            return null;
        }

        String formName = request.getParameter("formName");
        if (formName == null || formName.isBlank()) {
            return req;
        }

        String rawState = req.getState() + "|" + formName;
        String encodedState = Base64.getUrlEncoder().withoutPadding()
                .encodeToString(rawState.getBytes(StandardCharsets.UTF_8));

        return OAuth2AuthorizationRequest.from(req)
                .state(encodedState)
                .build();
    }
}
