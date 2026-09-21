package org.commonground.forma.config;

import java.util.List;

import org.commonground.forma.model.form.Translation;
import org.springframework.context.i18n.LocaleContextHolder;

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

    public static String getTranslation(List<Translation> translations) {
        if (translations == null || translations.isEmpty()) {
            return "";
        }

        String userLanguage = LocaleContextHolder.getLocale().getLanguage();

        return translations.stream()
                .filter(t -> userLanguage.equals(t.getLocale()))
                .map(Translation::getText)
                .findFirst()
                .orElseGet(() -> translations.get(0).getText());

    }
}
