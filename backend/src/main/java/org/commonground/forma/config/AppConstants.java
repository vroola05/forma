package org.commonground.forma.config;

import java.util.List;

public class AppConstants {
    private AppConstants() {
    }

    public static final String SYSTEM_TENANT_SLUG = "system";
    
    public static final List<String> PUBLIC_MATCHERS = List.of(
        "/",
        "/index.html",
        "/builder.html",
        "/favicon.svg",
        "/favicon.svg",
        "/favicon.ico",
        "/error",
        "/includes/**",
        "/css/**",
        "/js/**",
        "/images/**"
    );
}
