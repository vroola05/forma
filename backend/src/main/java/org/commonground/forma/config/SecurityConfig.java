package org.commonground.forma.config;

import org.commonground.forma.model.settings.constants.Permissions;
// import org.commonground.forma.config.tenant.SecurityTenantFilter;
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
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.HandlerExceptionResolver;

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
        http
                .securityMatcher("/system/**")
                .csrf(csrf -> csrf.disable())
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
        System.out.println("Configuring tenant and public security filter chain");
        http
                .csrf(csrf -> csrf.disable())
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

}