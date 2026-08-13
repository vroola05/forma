package org.commonground.forma.util;

import java.util.regex.Pattern;

public final class RegexConstants {
    private RegexConstants() {
        throw new UnsupportedOperationException();
    }

    public static final String SLUG_REGEX = "^[a-z0-9]+(?:-[a-z0-9]+)*$";
    public static final String EMAIL_REGEX = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$";
    public static final String COLOR_REGEX = "^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$";

    public static final Pattern SLUG = Pattern.compile(SLUG_REGEX);
    public static final Pattern EMAIL = Pattern.compile(EMAIL_REGEX);
    public static final Pattern COLOR = Pattern.compile(COLOR_REGEX);
}