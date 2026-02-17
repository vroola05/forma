package org.commonground.formbuilder.comparator;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import org.commonground.formbuilder.model.ComparatorForm;
import org.commonground.formbuilder.model.ComparatorType;
import org.commonground.formbuilder.model.form.CheckboxField;
import org.commonground.formbuilder.model.form.Field;
import org.commonground.formbuilder.model.form.FieldType;
import org.commonground.formbuilder.model.form.Form;
import org.commonground.formbuilder.model.form.FormGroup;
import org.commonground.formbuilder.model.form.Option;
import org.commonground.formbuilder.model.form.RepeatingGroup;
import org.commonground.formbuilder.model.form.TabPage;

public class CompareForms {
    public static List<ComparatorForm> compare(Form current, Form revision) {
        List<ComparatorForm> result = new ArrayList<>();

        // Vergelijk tabs vanuit current
        // current.getTabs().forEach(tab -> {
        //     String tabName = tab.getName();
        //     String tabTitle = tab.getLabel();
        //     revision.getTab(tabName).ifPresentOrElse(
        //             tabRev -> {
        //                 result.add(new ComparatorForm(ComparatorType.NOT_CHANGED, tabName, tabTitle, null, null));
        //                 compareFormGroups(result, tab, tabRev, tabTitle);
        //             },
        //             () -> result.add(new ComparatorForm(ComparatorType.ADDED, tabName, tabTitle, null, null)));
        // });

        // // Controleer tabs die verwijderd zijn
        // revision.getTabs().forEach(tabRev -> {
        //     if (current.getTab(tabRev.getName()).isEmpty()) {
        //         result.add(
        //                 new ComparatorForm(ComparatorType.DELETED, tabRev.getName(), tabRev.getLabel(), null, null));
        //     }
        // });
        return result;
    }

    private static void compareFormGroups(List<ComparatorForm> result, TabPage tabCurrent, TabPage tabRevision,
            String tabTitle) {
        // tabCurrent.getFormGroups().forEach(fg -> {
        //     String fgName = fg.getName();
        //     String fgTitle = !fg.getLabel().equals("") ? fg.getLabel() : fgName;

        //     tabRevision.getFormGroup(fgName).ifPresentOrElse(
        //             fgRev -> {
        //                 result.add(new ComparatorForm(ComparatorType.NOT_CHANGED, fgName, tabTitle + " / " + fgTitle,
        //                         null, null));

        //                 compareFields(result, fg, fgRev, tabTitle + " / " + fgTitle);
        //             },
        //             () -> result.add(
        //                     new ComparatorForm(ComparatorType.ADDED, fgName, tabTitle + " / " + fgTitle, null, null)));
        // });

        // // Controleer formgroups die verwijderd zijn
        // tabRevision.getFormGroups().forEach(fgRev -> {
        //     if (tabCurrent.getFormGroup(fgRev.getName()).isEmpty()) {
        //         result.add(new ComparatorForm(ComparatorType.DELETED, fgRev.getName(),
        //                 tabTitle + " / " + fgRev.getLabel(), null, null));
        //     }
        // });
    }

    private static void compareFields(List<ComparatorForm> result, FormGroup fgCurrent, FormGroup fgRevision,
            String prefixTitle) {
        fgCurrent.getFields().forEach(field -> {
            String fieldName = field.getName();
            String fieldLabel = field.getLabel();

            fgRevision.getField(fieldName).ifPresentOrElse(
                    fieldRev -> {
                        compareFeld(result, prefixTitle + " / " + fieldLabel, field, fieldRev);
                    },
                    () -> result.add(new ComparatorForm(ComparatorType.ADDED, fieldName,
                            prefixTitle + " / " + fieldLabel, field.getValue(), null)));
        });

        fgRevision.getFields().forEach(fieldRev -> {
            if (fgCurrent.getField(fieldRev.getName()).isEmpty()) {
                result.add(new ComparatorForm(ComparatorType.DELETED, fieldRev.getName(),
                        prefixTitle + " / " + fieldRev.getLabel(), null, fieldRev.getValue()));
            }
        });
    }

    public static void compareRepeatingSets(List<ComparatorForm> result,
            String prefixTitle,
            RepeatingGroup field,
            RepeatingGroup fieldRev) {
        List<List<Field>> setsCurrent = field.getSets();
        List<List<Field>> setsRevision = fieldRev.getSets();

        int max = Math.max(setsCurrent.size(), setsRevision.size());

        for (int i = 0; i < max; i++) {
            String label = prefixTitle + " / " + field.getLabel() + " / " + i;

            List<Field> setCur = (i < setsCurrent.size()) ? setsCurrent.get(i) : null;
            List<Field> setRev = (i < setsRevision.size()) ? setsRevision.get(i) : null;

            addFieldSet(result, label, setCur, setRev);
        }
    }

    public static void addFieldSet(List<ComparatorForm> result,
            String prefixTitle,
            List<Field> current,
            List<Field> revision) {

        if (current == null && revision == null) {
            return;
        }

        ComparatorType type = null;
        List<Field> loopList;

        if (current == null) {
            type = ComparatorType.DELETED;
            loopList = revision;
        } else if (revision == null) {
            type = ComparatorType.ADDED;
            loopList = current;
        } else {
            type = ComparatorType.CHANGED;
            loopList = current;
        }

        for (int i = 0; i < loopList.size(); i++) {
            String title = prefixTitle + " / " + loopList.get(i).getLabel();

            switch (type) {
                case CHANGED:
                    if (i < revision.size()) {
                        compareFeld(result, title, current.get(i), revision.get(i));
                    } else {
                        // nieuw veld toegevoegd
                        result.add(new ComparatorForm(ComparatorType.ADDED,
                                current.get(i).getName(), title,
                                current.get(i).getValue(), null));
                    }
                    break;

                case DELETED:
                    result.add(new ComparatorForm(type,
                            loopList.get(i).getName(), title,
                            null, loopList.get(i).getValue()));
                    break;

                case ADDED:
                    result.add(new ComparatorForm(type,
                            loopList.get(i).getName(), title,
                            loopList.get(i).getValue(), null));
                    break;
            }
        }
    }

    public static void compareFeld(List<ComparatorForm> result, String prefixTitle, Field current, Field revision) {
        if (hasValue(current.getType())) {
            result.add(new ComparatorForm(isChanged(current.getValue(), revision.getValue())
                    ? ComparatorType.CHANGED
                    : ComparatorType.NOT_CHANGED, current.getName(), prefixTitle + " / " + current.getLabel(),
                    current.getValue(), revision.getValue()));
        } else if (hasOptions(current.getType())) {
            CheckboxField rf = (CheckboxField) current;
            CheckboxField rrevision = (CheckboxField) revision;

            List<Option> fop = rf.getOptions().stream().filter(f -> f.isSelected()).toList();
            List<Option> fopRev = rrevision.getOptions().stream().filter(f -> f.isSelected()).toList();

            // result.add(new ComparatorForm(isChanged(fop, fopRev)
            //         ? ComparatorType.CHANGED
            //         : ComparatorType.NOT_CHANGED, current.getName(), prefixTitle + " / " + current.getLabel(),
            //         Convert.optionalValues(Optional.ofNullable(fop)),
            //         Convert.optionalValues(Optional.ofNullable(fopRev))));
        } else {
            compareRepeatingSets(result, prefixTitle, (RepeatingGroup) current, (RepeatingGroup) revision);
        }
    }

    public static boolean hasOptions(FieldType type) {
        return FieldType.CHECKBOX.equals(type);
    }

    public static boolean hasValue(FieldType type) {
        return FieldType.LABEL.equals(type) || FieldType.VALUTA.equals(type) || FieldType.TEXT.equals(type)
                || FieldType.NUMBER.equals(type) || FieldType.TEXTAREA.equals(type) || FieldType.DATE.equals(type)
                || FieldType.HIDDEN.equals(type) || FieldType.SELECT.equals(type) || FieldType.RADIO.equals(type);
    }

    public static boolean isChanged(String current, String revision) {
        return !Objects.equals(current, revision);
    }

    private static boolean isChanged(List<Option> values, List<Option> values2) {
        if (values == null && values2 == null) {
            return false;
        }
        if (values == null || values2 == null) {
            return true;
        }
        return !new HashSet<>(values).equals(new HashSet<>(values2));
    }
}
