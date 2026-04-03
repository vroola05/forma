

import { LabelField } from '../../shared/form-components/label-field.js';
import { TextField } from '../../shared/form-components/text-field.js';
import { RadioField } from '../../shared/form-components/radio-field.js';
import { ValutaField } from '../../shared/form-components/valuta-field.js';
import { SelectField } from '../../shared/form-components/select-field.js';
import { HiddenField } from '../../shared/form-components/hidden-field.js';
import { DateField } from '../../shared/form-components/date-field.js';
import { TextAreaField } from '../../shared/form-components/textarea-field.js';
import { CheckboxField } from '../../shared/form-components/checkbox-field.js';

import { FormGroup } from '../../shared/form-components/form-group.js';
import { Form } from '../../shared/form-components/form.js';
import { FormSummaryRenderer } from './form-summary-renderer.js';
import { RepeatingGroup } from '../../shared/form-components/repeating-group.js';

export class FormRenderer {

    static getFormData(form) {
        return {
            name: form.name,
            type: form.type,
            id: form.id,
            fields: FormRenderer.#getTabsData(form)
        }
    }

    static #getTabsData(form) {
        return form.fields.filter(tabContent => tabContent.name !== 'summary').map(tabContent => {
            return {
                name: tabContent.name,
                label: tabContent.label,
                type: tabContent.type,
                id: tabContent.id,
                fields: FormRenderer.#getTabFieldData(tabContent)
            };
        });
    }

    static #getTabFieldData(tabContent) {
        return tabContent.getFields().map(field => {
            if (field.type === 'form-group') {
                return FormRenderer.#getFormGroupsData(field);
            } else {
                return FormRenderer.#getFieldData(field);
            }
        });
    }

    static #getFormGroupsData(formGroup) {
        return {
            name: formGroup.name,
            label: formGroup.label,
            type: formGroup.type,
            id: formGroup.id,
            fields: FormRenderer.#getFieldsData(formGroup)
        }
    }

    static #getFieldsData(fields) {
        return fields.getFields().map(field => {
           return FormRenderer.#getFieldData(field);
        });
    }

    static #getFieldData(field) {
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
        return;
    }


    static getFormKeyVal(form) {
        return {
            fields: FormRenderer.#getTabKeyVal(form)
        }
    }

    static #getTabKeyVal(form) {
        return form.fields.filter(tabContent => tabContent.name !== 'summary').reduce((acc, tabContent) => {
                acc[tabContent.name] = FormRenderer.#getFieldKeyVal(tabContent);
                return acc;
            }, {});
    }

    static #getFieldKeyVal(tabContent) {
        
        return tabContent.getFields().reduce((acc, field) => {
            if (field.type === 'form-group') {
                acc[field.name] = FormRenderer.#getFormGroupKeyValData(field);
            } else {
                acc[field.name] = FormRenderer.#getFieldKeyValData(field);
            }
            return acc;
        }, {});
    }

    static #getFormGroupKeyValData(formGroup) {
        return formGroup.getFields().reduce((acc, field) => {
            acc[field.name] = FormRenderer.#getFieldKeyValData(field);
            return acc;
        }, {});
    }

    static #getFieldKeyValData(field) {
        switch (field.type) {
             case 'select':
                return field.getOptions();
            case 'radio':
                return field.getOptions();
            case 'checkbox':
                return field.getOptions();

        }
        return field.getValue();
    }
    
    static createForm(formData, state) {
        const form = new Form(formData, state);
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

    static createField(fieldData, state = null) {
        switch (fieldData.type) {
            case 'hidden':
                return new HiddenField(fieldData.name, fieldData.label)
                    .setMetadata(fieldData.metadata)
                    .setData(fieldData.data)
                    .setValue(state ? state : fieldData.value, true);
                
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
                    .setValue(state ? state : fieldData.value, true)
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
                    .setValue(state ? state : fieldData.value, true)
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
                    .setValue(state ? state : fieldData.value, true)
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
                    .setValue(state ? state : fieldData.value, true)
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
                    .setValue(state ? state : fieldData.value, true)
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
                    .setValue(state ? state : fieldData.value, true)
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
                    .setValue(state ? state : fieldData.value)
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
                    .setValue(state ? state : fieldData.value)
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
                    .setValue(state ? state : fieldData.value)
                    .setShowConditions(fieldData.condition);
            case 'form-group':
                return new FormGroup(fieldData, state);
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