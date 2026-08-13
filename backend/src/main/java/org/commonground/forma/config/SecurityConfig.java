package org.commonground.forma.config;

import java.io.IOException;

import org.commonground.forma.model.settings.constants.Permissions;
import org.commonground.forma.services.TenantUserDetailsService;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.HandlerExceptionResolver;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Configuration(proxyBeanMethods = false)
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {
    private final HandlerExceptionResolver resolver;
    // private final SecurityTenantFilter securityTenantFilter;
    private final TenantUserDetailsService tenantUserDetailsService;
    private final PasswordEncoder passwordEncoder;

    // Injecteer de volledig door Spring opgebouwde filter
    public SecurityConfig(
            @Qualifier("handlerExceptionResolver") HandlerExceptionResolver resolver,
            // SecurityTenantFilter securityTenantFilter,
            TenantUserDetailsService tenantUserDetailsService,
            PasswordEncoder passwordEncoder) {

        this.resolver = resolver;
        // this.securityTenantFilter = securityTenantFilter;
        this.tenantUserDetailsService = tenantUserDetailsService;
        this.passwordEncoder = passwordEncoder;

    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider(this.tenantUserDetailsService);
        authProvider.setPasswordEncoder(this.passwordEncoder);
        return authProvider;
    }

    @Bean
    @Order(1)
    public SecurityFilterChain globalAdminFilterChain(HttpSecurity http) throws Exception {
        CsrfTokenRequestAttributeHandler requestHandler = new CsrfTokenRequestAttributeHandler();
        
        http
                .securityMatcher("/system/**")
                .csrf(csrf -> csrf
                
                .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
                .csrfTokenRequestHandler(requestHandler)
            )
            .addFilterAfter(new CsrfCookieFilter(), org.springframework.security.web.csrf.CsrfFilter.class)
                .authorizeHttpRequests(authz -> authz
                        .requestMatchers(AppConstants.PUBLIC_MATCHERS.toArray(String[]::new)).permitAll()
                        .requestMatchers(
                                "/system/page/**",
                                "/system/admin",
                                "/system/admin/page/**",
                                "/system/api/login",
                                "/system/api/tenant",
                                "/system/api/language/nl")
                        .permitAll()
                        .anyRequest().hasAuthority(Permissions.TENANT_READ_INTERNAL))
                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint(
                                (req, res, authException) -> resolver.resolveException(req, res, null,
                                        new ResponseStatusException(
                                                HttpStatus.UNAUTHORIZED, "{login.failure}"))))
                .formLogin(form -> form
                        .loginPage("/system/admin/page/login")
                        .loginProcessingUrl("/system/api/login")
                        .successHandler((req, res, auth) -> res.setStatus(HttpStatus.OK.value()))
                        .failureHandler((req, res, authException) -> resolver.resolveException(req, res, null,
                                new ResponseStatusException(
                                        HttpStatus.UNAUTHORIZED, "{login.failure}")))
                        .permitAll())
                .logout(logout -> logout
                        .logoutUrl("/system/api/logout")
                        .logoutSuccessHandler((req, res, auth) -> res.setStatus(HttpStatus.OK.value()))

                        .invalidateHttpSession(true)
                        .deleteCookies("JSESSIONID"));

        return http.build();
    }

    @Bean
    @Order(2)
    public SecurityFilterChain tenantAndPublicFilterChain(HttpSecurity http) throws Exception {
        CsrfTokenRequestAttributeHandler requestHandler = new CsrfTokenRequestAttributeHandler();

        http
        .csrf(csrf -> csrf
                
                .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
                .csrfTokenRequestHandler(requestHandler)
            )
            .addFilterAfter(new CsrfCookieFilter(), org.springframework.security.web.csrf.CsrfFilter.class)
                
                .authorizeHttpRequests(authz -> authz
                        .requestMatchers(AppConstants.PUBLIC_MATCHERS.toArray(String[]::new)).permitAll()
                        .requestMatchers(
                                "/{tenantSlug}/public/**",
                                "/{tenantSlug}/page/**",
                                "/{tenantSlug}/admin",
                                "/{tenantSlug}/admin/page/**",
                                "/{tenantSlug}/api/tenant",
                                "/{tenantSlug}/api/tenant/logo",
                                "/{tenantSlug}/api/language/nl",
                                "/{tenantSlug}/api/forms/**"
                        )
                        .permitAll()
                        .requestMatchers(
                                "/{tenantSlug}/admin/**",
                                "/{tenantSlug}/api/**")
                        .authenticated()
                        .anyRequest().denyAll())
                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint((req, res, authException) -> resolver.resolveException(req, res, null,
                                new ResponseStatusException(
                                        HttpStatus.UNAUTHORIZED, "{login.failure}"))))
                .formLogin(form -> form
                        .loginPage("/{tenantSlug}/admin/page/login")
                        .loginProcessingUrl("/{tenantSlug}/api/login")
                        .successHandler((req, res, auth) -> res.setStatus(HttpStatus.OK.value()))
                        .failureHandler((req, res, authException) -> resolver.resolveException(req, res, null,
                                new ResponseStatusException(
                                        HttpStatus.UNAUTHORIZED, "{login.failure}")))
                        .permitAll())
                .logout(logout -> logout
                        .logoutUrl("/{tenantSlug}/api/logout")
                        .logoutSuccessHandler((req, res, auth) -> res.setStatus(HttpStatus.OK.value()))

                        .invalidateHttpSession(true)
                        .deleteCookies("JSESSIONID"));

        return http.build();
    }

    private static final class CsrfCookieFilter extends OncePerRequestFilter {
        @Override
        protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
                throws ServletException, IOException {
            CsrfToken csrfToken = (CsrfToken) request.getAttribute(CsrfToken.class.getName());
            if (csrfToken != null) {
                csrfToken.getToken(); // Dit forceert het laden en aanmaken van de cookie
            }
            filterChain.doFilter(request, response);
        }
    }
}