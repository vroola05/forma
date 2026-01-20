import { RadioField, LabelField, TextField, ValutaField, SelectField, HiddenField, DateField, TextAreaField, CheckboxField } from '../form/input-fields.js';
import { Form } from '../form/form.js';
import { FormSummaryRenderer } from './form-summary-renderer.js';
import { RepeatingGroup } from '../form/repeating-group.js';

export class FormRenderer {

    static getFormData(form) {
        return {
            name: form.name,
            type: form.type,
            tabs: FormRenderer.#getTabsData(form)
        }
    }
    static #getTabsData(form) {
    return form.fields.filter(tabContent => tabContent.name !== 'summary').map(tabContent => {
            return {
                name: tabContent.name,
                label: tabContent.label,
                type: tabContent.type,
                formGroups: FormRenderer.#getFormGroupsData(tabContent)
            };
        });
    }

    static #getFormGroupsData(tabContent) {
        return tabContent.getFields().map(formGroup => {
            return {
                name: formGroup.name,
                label: formGroup.label,
                type: formGroup.type,
                fields: FormRenderer.#getFieldsData(formGroup)
            }
        });
    }

    static #getFieldsData(formGroup) {
        return formGroup.getFields().map(field => {
            if (field.type == 'repeating-group') {
                return {
                    name: field.name,
                    type: field.type,
                    label: field.label,
                    sets: field.groupInputSets.map(set => {
                        return set.map(repField => {
                            return {
                                name: repField.name,
                                type: repField.type,
                                value: !repField.hasOptions() ? repField.getValue() : '',
                                values: repField.hasOptions() ? repField.getOptions() : undefined,
                                label: repField.label,
                                classes: field.classes,
                                readonly: repField.readonly,
                                data: Object.fromEntries(repField.data)
                            }
                        })
                    })
                };
            } else {
                return {
                    name: field.name,
                    type: field.type,
                    value: !field.hasOptions() ? field.getValue() : '',
                    values: field.hasOptions() ? field.getOptions() : undefined,
                    label: field.label,
                    classes: field.classes,
                    readonly: field.readonly,
                    data: Object.fromEntries(field.data)
                }
            }
        });
    }

    static createForm(formData) {
        const form = new Form(formData);
        const summaryTab = form.createTab({name:'summary', label: 'Summary'});
        const summaryRenderer = new FormSummaryRenderer(form);
        summaryTab.setContent(summaryRenderer);
        return form;
    }

    static #createRepeatingSets(sets) {
        const repeatingSets = [];
        if (sets) {
            sets.forEach(set => {
                repeatingSets.push(FormRenderer.createFields(set));
            });
        }
        return repeatingSets;
    }

    static createFields(fields) {
        const fieldsInstances = [];
        fields.forEach(fieldData => {
            fieldsInstances.push(FormRenderer.createField(fieldData));
        });
        return fieldsInstances;
    }

    static createField(fieldData) {
        switch (fieldData.type) {
            case 'hidden':
                return new HiddenField(fieldData.name, fieldData.label)
                    .setMetadata(fieldData.metadata)
                    .setData(fieldData.data)
                    .setValue(fieldData.value, true);
                
            case 'label':
                return new LabelField(fieldData.name, fieldData.label)
                    .setMetadata(fieldData.metadata)
                    .setData(fieldData.data)
                    .setClasses(fieldData.classes)
                    .setRequired(fieldData.required)
                    .setMinLength(fieldData.minlength)
                    .setMaxLength(fieldData.maxlength)
                    .setLabel(fieldData.label)
                    .setPlaceholder(fieldData.placeholder)
                    .setReadonly(fieldData.readonly)
                    .setValue(fieldData.value, true)
                    .setShowConditions(fieldData.condition);
                
            case 'text':
                return new TextField(fieldData.name, fieldData.label)
                    .setMetadata(fieldData.metadata)
                    .setData(fieldData.data)
                    .setClasses(fieldData.classes)
                    .setRequired(fieldData.required)
                    .setMinLength(fieldData.minlength)
                    .setMaxLength(fieldData.maxlength)
                    .setLabel(fieldData.label)
                    .setPlaceholder(fieldData.placeholder)
                    .setReadonly(fieldData.readonly)
                    .setValue(fieldData.value, true)
                    .setShowConditions(fieldData.condition);
                
            case 'number':
                return new TextField(fieldData.name, fieldData.label)
                    .setType('number')
                    .setMetadata(fieldData.metadata)
                    .setData(fieldData.data)
                    .setClasses(fieldData.classes)
                    .setRequired(fieldData.required)
                    .setMinLength(fieldData.minlength)
                    .setMaxLength(fieldData.maxlength)
                    .setLabel(fieldData.label)
                    .setPlaceholder(fieldData.placeholder)
                    .setReadonly(fieldData.readonly)
                    .setValue(fieldData.value, true)
                    .setShowConditions(fieldData.condition);
                
            case 'valuta':
                return new ValutaField(fieldData.name, fieldData.label)
                    .setType('text')
                    .setMetadata(fieldData.metadata)
                    .setData(fieldData.data)
                    .setClasses(fieldData.classes)
                    .setRequired(fieldData.required)
                    .setMinLength(fieldData.minlength)
                    .setMaxLength(fieldData.maxlength)
                    .setLabel(fieldData.label)
                    .setPlaceholder(fieldData.placeholder)
                    .setReadonly(fieldData.readonly)
                    .setValue(fieldData.value, true)
                    .setShowConditions(fieldData.condition);
                
            case 'date':
                return new DateField(fieldData.name, fieldData.label)
                    .setType('date')
                    .setMetadata(fieldData.metadata)
                    .setData(fieldData.data)
                    .setClasses(fieldData.classes)
                    .setRequired(fieldData.required)
                    .setMinLength(fieldData.minlength)
                    .setMaxLength(fieldData.maxlength)
                    .setLabel(fieldData.label)
                    .setPlaceholder(fieldData.placeholder)
                    .setReadonly(fieldData.readonly)
                    .setValue(fieldData.value, true)
                    .setShowConditions(fieldData.condition);
                
            case 'textarea':
                return new TextAreaField(fieldData.name, fieldData.label)
                    .setMetadata(fieldData.metadata)
                    .setData(fieldData.data)
                    .setRequired(fieldData.required)
                    .setClasses(fieldData.classes)
                    .setMinLength(fieldData.minlength)
                    .setMaxLength(fieldData.maxlength)
                    .setLabel(fieldData.label)
                    .setPlaceholder(fieldData.placeholder)
                    .setReadonly(fieldData.readonly)
                    .setValue(fieldData.value, true)
                    .setShowConditions(fieldData.condition);
                
            case 'radio':
                return new RadioField(fieldData.name, fieldData.label, fieldData.classes)
                    .setType(fieldData.type)
                    .setMetadata(fieldData.metadata)
                    .setData(fieldData.data)
                    .setRequired(fieldData.required)
                    .setClasses(fieldData.classes)
                    .addOptions(fieldData.options)
                    .setReadonly(fieldData.readonly)
                    // .setValue(fieldData.value)
                    .setShowConditions(fieldData.condition);
            case 'checkbox':
                return new CheckboxField(fieldData.name, fieldData.label, fieldData.classes)
                    .setType(fieldData.type)
                    .setMetadata(fieldData.metadata)
                    .setData(fieldData.data)
                    .setRequired(fieldData.required)
                    .setClasses(fieldData.classes)
                    .addOptions(fieldData.options)
                    .setReadonly(fieldData.readonly)
                    .setValue(fieldData.value)
                    .setShowConditions(fieldData.condition);
            case 'select':
                return new SelectField(fieldData.name, fieldData.label, fieldData.classes)
                    .setType(fieldData.type)
                    .setMetadata(fieldData.metadata)
                    .setData(fieldData.data)
                    .setRequired(fieldData.required)
                    .setClasses(fieldData.classes)
                    .setPlaceholder(fieldData.placeholder)
                    .addOptions(fieldData.options)
                    .setReadonly(fieldData.readonly)
                    .setValue(fieldData.value)
                    .setShowConditions(fieldData.condition);
                    console.log('tot hier11144');

            case 'repeating-group':
                return new RepeatingGroup(fieldData.name, fieldData.label, fieldData.classes, fieldData.layout)
                    .setType(fieldData.type)
                    .setMetadata(fieldData.metadata)
                    .setMinLength(fieldData.minSize)
                    .setMaxLength(fieldData.maxSize)
                    .registerSet(FormRenderer.createFields(fieldData.fields))
                    .addSet(FormRenderer.#createRepeatingSets(fieldData.sets))
                
                
            // Add more cases for other field types as needed
            default:
                console.warn(`Unknown field type: ${fieldData.type}`);
                return;
        }
    }
}