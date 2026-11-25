package org.commonground.forma.config.security.oauth;

import java.io.IOException;

import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class OAuth2FormRedirectFilter extends OncePerRequestFilter {

    public static final String SESSION_FORM_NAME = "OAUTH2_TARGET_FORM_NAME";

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        // Alleen uitvoeren bij de start van de OAuth2 flow
        if (request.getRequestURI().contains("/oauth2/authorization/")) {
            String formName = request.getParameter("formName");
            if (formName != null && !formName.isBlank()) {
                request.getSession().setAttribute(SESSION_FORM_NAME, formName);
            }
        }
        
        filterChain.doFilter(request, response);
    }
}
