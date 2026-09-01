package org.commonground.forma.database.dao.translation;

import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

public class FieldTranslationId implements Serializable {
    private UUID field;
    private String locale;

    public FieldTranslationId() {}

    public FieldTranslationId(UUID field, String locale) {
        this.field = field;
        this.locale = locale;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        FieldTranslationId that = (FieldTranslationId) o;
        return Objects.equals(field, that.field) && Objects.equals(locale, that.locale);
    }

    @Override
    public int hashCode() {
        return Objects.hash(field, locale);
    }
}
 
