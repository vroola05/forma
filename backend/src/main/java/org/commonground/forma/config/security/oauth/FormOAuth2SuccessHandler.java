package org.commonground.forma.config.security.oauth;

import java.io.IOException;

import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

@Component
public class FormOAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        System.out.println("FormOAuth2SuccessHandler - onAuthenticationSuccess");
        // 1. Haal de tenantSlug uit het eerste segment van de request URI (bijv. "/kip/login/oauth2/code/...")
        String tenantSlug = extractTenantSlug(request.getRequestURI());

        // 2. Haal de opgeslagen formName uit de sessie en ruim deze direct op
        HttpSession session = request.getSession(false);
        String formName = null;
        if (session != null) {
            formName = (String) session.getAttribute(OAuth2FormRedirectFilter.SESSION_FORM_NAME);
            session.removeAttribute(OAuth2FormRedirectFilter.SESSION_FORM_NAME);
        }

        // 3. Bouw de terugkeer-URL op (relatief, zodat het werkt op zowel localhost:5173 als custom CNAME domains)
        String targetUrl;
        if (formName != null && !formName.isBlank()) {
            targetUrl = String.format("/%s/page/form/%s", tenantSlug, formName);
        } else {
            // Fallback als er geen specifiek formulier bekend was
            targetUrl = String.format("/%s/page", tenantSlug);
        }

        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }

    private String extractTenantSlug(String requestUri) {
        System.out.println("FormOAuth2SuccessHandler - extractTenantSlug");
        // requestUri is bijvoorbeeld "/kip/login/oauth2/code/4eafd2c0-..."
        String[] segments = requestUri.split("/");
        return (segments.length > 1) ? segments[1] : "";
    }
}
