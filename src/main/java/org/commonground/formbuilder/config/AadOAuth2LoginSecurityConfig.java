package org.commonground.formbuilder.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;


@Configuration(proxyBeanMethods = false)
@EnableWebSecurity
@EnableMethodSecurity
public class AadOAuth2LoginSecurityConfig {
    private static final Logger logger = LoggerFactory.getLogger(AadOAuth2LoginSecurityConfig.class);

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.csrf(csrf -> csrf
                .ignoringRequestMatchers("/api/**")
            )
            .logout(logout -> logout
                .logoutSuccessUrl("/index.html")
            )
            
            
            .authorizeHttpRequests(authz -> authz
                .requestMatchers("/", "/index.html", "/builder.html", "/favicon.svg", "/favicon.ico", "/error", "/includes/**", "/css/**", "/js/**", "/images/**").permitAll()
                .requestMatchers("/admin", "/admin/**", "/form-builder", "/form-builder/**", "/page/**", "/api/userinfo", "/api/**").permitAll()
                .anyRequest().denyAll()
            );
        return http.build();
    }

}