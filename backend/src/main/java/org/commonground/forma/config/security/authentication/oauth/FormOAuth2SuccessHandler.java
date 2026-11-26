package org.commonground.forma.config.security.authentication.oauth;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

import org.commonground.forma.config.tenant.TenantContext;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class FormOAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        String formName = extractFormNameFromState(request.getParameter("state"));
        String tenantSlug = TenantContext.getTenant().getSlug();

        if (response.isCommitted()) {
            return;
        }
        if (formName != null) {
            response.sendRedirect("/" + tenantSlug + "/page/form/" + formName);
        } else {
            response.sendRedirect("/" + tenantSlug + "/page/form/error");
        }

    }

    private String extractFormNameFromState(String encodedState) {
        if (encodedState == null || encodedState.isBlank()) {
            return null;
        }
        try {
            byte[] decodedBytes = Base64.getUrlDecoder().decode(encodedState);
            String rawState = new String(decodedBytes, StandardCharsets.UTF_8);

            String[] parts = rawState.split("\\|", 2);
            return parts.length == 2 ? parts[1] : null;
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
}
