package org.commonground.formbuilder.model.form;

import java.util.Objects;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Option {
    private String value;
    private String text;
    private boolean selected;

    public Option clone() {
        return new Option(value, text, selected);
    }

    public void setSelected(boolean selected) {
        this.selected = selected;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true; // zelfde object
        if (!(o instanceof Option))
            return false; // ander type
        Option option = (Option) o;
        return selected == option.selected && // boolean vergelijken
                Objects.equals(value, option.value) &&
                Objects.equals(text, option.text);
    }

    @Override
    public int hashCode() {
        return Objects.hash(value, text, selected);
    }

    @Override
    public String toString() {
        return "Option{" +
                "value='" + value + '\'' +
                ", text='" + text + '\'' +
                ", selected=" + selected +
                '}';
    }
}
