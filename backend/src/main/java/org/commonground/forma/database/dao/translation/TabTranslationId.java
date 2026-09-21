package org.commonground.forma.database.dao.translation;

import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

public class TabTranslationId implements Serializable {
    private UUID tab;
    private String locale;

    public TabTranslationId() {}

    public TabTranslationId(UUID tab, String locale) {
        this.tab = tab;
        this.locale = locale;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        TabTranslationId that = (TabTranslationId) o;
        return Objects.equals(tab, that.tab) && Objects.equals(locale, that.locale);
    }

    @Override
    public int hashCode() {
        return Objects.hash(tab, locale);
    }
}
 
