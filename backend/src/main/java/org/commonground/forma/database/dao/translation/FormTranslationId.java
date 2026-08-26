package org.commonground.forma.database.dao.translation;

import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

public class FormTranslationId implements Serializable {
    private UUID form;
    private String locale;

    public FormTranslationId() {}

    public FormTranslationId(UUID form, String locale) {
        this.form = form;
        this.locale = locale;
    }

    // Belangrijk: Implementeer equals en hashCode!
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        FormTranslationId that = (FormTranslationId) o;
        return Objects.equals(form, that.form) && Objects.equals(locale, that.locale);
    }

    @Override
    public int hashCode() {
        return Objects.hash(form, locale);
    }
}
 
