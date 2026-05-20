package org.commonground.formbuilder.config;

import java.util.List;

public class SecurityConstants {
    private SecurityConstants() {
    }

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
