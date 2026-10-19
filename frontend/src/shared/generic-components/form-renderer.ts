




import { FormService } from '../../form-viewer/services/form-service';
import { Form, FormOptions } from '../form-components/form';
import type { InputNucleus } from '../form-components/interface/input-base';
import type { Nucleus } from '../form-components/interface/nucleus';
import { AllFieldTypes, BaseFieldDto, FieldDto, FileOptionFieldDto, FormDto, INPUT_FIELD_TYPES, InputFieldDto, InputFieldType, OptionFieldDto, OptionFieldType, OPTIONS_FIELD_TYPES, RepeatingGroupDto, RichTextFieldDto } from '../model/types';

/**
 * Uses dynamic imports to prevent endless loops
 */
export class FormRenderer {
    static getFormData(form: Form): any {
        return {
            name: form.name,
            type: form.type,
            clientSessionId: form.clientSessionId,
            id: form.id,
            fields: FormRenderer.#getTabsData(form),
            confirmationCheck: !form.getConfirmationCheck() ? undefined : FormRenderer.#getFieldsData(form.getConfirmationCheck() as InputNucleus[])
        }
    }

    static #getTabsData(form: Form) {
        return form.fields.filter(tabContent => tabContent.name !== 'summary').map(tabContent => {
            return {
                name: tabContent.name,
                label: tabContent.label,
                type: tabContent.type,
                id: tabContent.id,
                fields: FormRenderer.#getFieldsData(tabContent.fields)
            };
        });
    }

    static #getFieldsData(fields: Nucleus[]) {
        return fields.map(child => {
            if (child.hasChildren()) {
                return FormRenderer.#getFieldFormGroup(child);
            } else if (child.hasSets()) {
                return FormRenderer.#getFieldRepeatingGroup(child);
            } else {
                return FormRenderer.#getField(child as InputNucleus);
            }
        });
    }

    static #getFieldFormGroup(child: Nucleus): BaseFieldDto {
        return {
            name: child.name,
            label: child.label,
            type: child.type as InputFieldType,
            id: child.id,
            fields: FormRenderer.#getFieldsData(child.getFields() || [])
        }
    }

    static #getFieldRepeatingGroup(child: Nucleus): RepeatingGroupDto {
        return {
            name: child.name,
            label: child.label,
            type: child.type as AllFieldTypes,
            id: child.id,
            layout: undefined,
            sets: child.getSets().map(childSet => {
                return childSet.map(childField => {
                    if (childField.hasSets()) {
                        return FormRenderer.#getFieldRepeatingGroup(childField) as FieldDto;
                    } else {
                        return FormRenderer.#getField(childField as InputNucleus) as FieldDto;
                    }
                    
                })
            })
        };
    }

    static #getField(field: InputNucleus): InputFieldDto | OptionFieldDto {

        if (field.type === 'file') {
            return {
                name: field.name,
                type: field.type,
                values: !field.getOptions() ? [] : field.getOptions(),
                label: field.label,
                classes: field.classes,
                readonly: field.readonly
            }
        } else if (this.isOptionType(field.type)) {
         
            return {
                name: field.name,
                type: field.type as OptionFieldType,
                values: field.getOptions(),
                label: field.label,
                classes: field.classes,
                readonly: field.readonly
            } as OptionFieldDto
        } else if (this.isInputType(field.type)) {
            return {
                name: field.name,
                type: field.type as InputFieldType,
                value: field.getValue(),
                label: field.label,
                classes: field.classes,
                readonly: field.readonly
            } as InputFieldDto
        } else {
            throw new Error('Field not found');
        }
    }

    /**
     * Returns a new form.
     * 
     * @param {*} formData 
     * @returns 
     */
    static async createForm(formDto: FormDto, clientSessionId: string | undefined = undefined, options: FormOptions | undefined = undefined) {
        const { Form } = await import( '../form-components/form');

        const form = await Form.create(formDto, options);
        form.setClientSessionId(clientSessionId);

        FormService.formReady();
        // Logic that needs to be initialized after the form is loaded.
        // For example the showconditions
        const fields = FormService.getNucleus();
        
        for (const element of fields) {
            element.afterFormInit();
        }

        return form;
    }

    static isInputType(type: string): type is InputFieldType {
        return (INPUT_FIELD_TYPES as readonly string[]).includes(type);
    }

    static isOptionType(type: string): type is OptionFieldType {
        return (OPTIONS_FIELD_TYPES as readonly string[]).includes(type);
    }

    /**
     * 
     * @param fieldDto 
     * @returns 
     */
    static async createField(fieldDto: FieldDto, prefix: string | undefined = undefined): Promise<Nucleus> {
        if (this.isInputType(fieldDto.type)) {
            return await this.createInputField(fieldDto as InputFieldDto, prefix);
        } else if (this.isOptionType(fieldDto.type)) {
            return await this.createOptionField(fieldDto as OptionFieldDto, prefix);
        } else {

            switch (fieldDto.type) {
                case 'form-group': {
                    const { FormGroup } = await import('../form-components/form-group');
                    const formGroup = new FormGroup(fieldDto, fieldDto.id);
                    await formGroup.init(fieldDto);
                    return formGroup;
                }
                case 'repeating-group': {
                    const { RepeatingGroup } = await import('../form-components/repeating-group');

                    const repeatingGroup = new RepeatingGroup((fieldDto as RepeatingGroupDto), fieldDto.id)
                    await repeatingGroup.init(fieldDto);
                    return repeatingGroup;

                    // .setMinLength(fieldDto.minSize)
                    // .setMaxLength(fieldDto.maxSize)
                    // .registerSet(FormRenderer.createFields(fieldDto.fields))
                    // .addSet(FormRenderer.#createRepeatingSets(fieldDto.sets))
                }
                // Add more cases for other field types as needed
                default:
                    throw new Error(`Unknown field type: ${fieldDto.type}`);
            }
        }
    }

    static async createInputField(fieldDto: InputFieldDto, prefix: string | undefined = undefined): Promise<Nucleus> {
        const { TextField } = await import('../form-components/text-field');
        let nucleus: InputNucleus;
        switch (fieldDto.type) {
            case 'hidden': {
                const { HiddenField } = await import('../form-components/hidden-field');
                nucleus = new HiddenField(fieldDto.name, fieldDto.labels, fieldDto.id)
                    .setValue(fieldDto.value, true);
                break;
            }
            case 'label': {
                const { LabelField } = await import('../form-components/label-field');
                nucleus = new LabelField(fieldDto.name, fieldDto.labels, fieldDto.id)
                    .setRequired(fieldDto.required)
                break;
            }
            case 'text':
                nucleus = new TextField(fieldDto.name, fieldDto.labels, fieldDto.id, prefix)
                    .setRequired(fieldDto.required)
                    .setMinLength(fieldDto.minLength)
                    .setMaxLength(fieldDto.maxLength)
                    .addValueChangedListener(fieldDto.change);
                break;
            case 'rich-text': {
                const { RichTextField } = await import('../form-components/rich-text-field');

                const richTextFieldDto = fieldDto as RichTextFieldDto;

                nucleus = new RichTextField(richTextFieldDto.name, richTextFieldDto.labels, richTextFieldDto.id)
                    .setRequired(richTextFieldDto.required)
                    .setInline(richTextFieldDto.inline)
                    .addValueChangedListener(richTextFieldDto.change);
                break;
            }
            case 'conditions-autocomplete': {
                const { ConditionsAutocompleteField } = await import('../form-components/conditions-autocomplete-field');
                nucleus = new ConditionsAutocompleteField(fieldDto.name, fieldDto.labels)
                    .setRequired(fieldDto.required)
                    .addValueChangedListener(fieldDto.change);
                break;
            }
            case 'conditions': {
                const { ConditionsField } = await import('../form-components/conditions-field');
                nucleus = new ConditionsField(fieldDto.name, fieldDto.labels)
                    .setRequired(fieldDto.required)
                    .addValueChangedListener(fieldDto.change);
                break;
            }
            case 'number':
                nucleus = new TextField(fieldDto.name, fieldDto.labels, fieldDto.id, prefix)
                    .setType('number')
                    .setRequired(fieldDto.required)
                    .setMinLength(fieldDto.minLength)
                    .setMaxLength(fieldDto.maxLength)
                    .addValueChangedListener(fieldDto.change);
                break;
            case 'valuta': {
                const { ValutaField } = await import('../form-components/valuta-field');
                nucleus = new ValutaField(fieldDto.name, fieldDto.labels, fieldDto.id)
                    .setType('text')
                    .setRequired(fieldDto.required)
                    .setMinLength(fieldDto.minLength)
                    .setMaxLength(fieldDto.maxLength)
                    .addValueChangedListener(fieldDto.change);
                break;
            }
            case 'date': {
                const { DateField } = await import('../form-components/date-field');
                nucleus = new DateField(fieldDto.name, fieldDto.labels, fieldDto.id)
                    .setType('date')
                    .setRequired(fieldDto.required)
                    .setMinLength(fieldDto.minLength)
                    .setMaxLength(fieldDto.maxLength)
                    .addValueChangedListener(fieldDto.change);
                break;
            }
            case 'textarea': {
                const { TextAreaField } = await import('../form-components/textarea-field');
                nucleus = new TextAreaField(fieldDto.name, fieldDto.labels, fieldDto.id)
                    .setType('textarea')
                    .setRequired(fieldDto.required)
                    .setMinLength(fieldDto.minLength)
                    .setMaxLength(fieldDto.maxLength)
                    .addValueChangedListener(fieldDto.change);
                break;
            }
            case 'email':
                nucleus = new TextField(fieldDto.name, fieldDto.labels, fieldDto.id, prefix)
                    .setType('email')
                    .setRequired(fieldDto.required)
                    .setMinLength(fieldDto.minLength)
                    .setMaxLength(fieldDto.maxLength)
                    .addValueChangedListener(fieldDto.change);
                break;
            case 'password': {
                const { PasswordField } = await import('../form-components/password-field');
                nucleus = new PasswordField(fieldDto.name, fieldDto.labels, fieldDto.id)
                    .setType('password')
                    .setRequired(fieldDto.required)
                    .setMinLength(fieldDto.minLength)
                    .setMaxLength(fieldDto.maxLength)
                    .addValueChangedListener(fieldDto.change);
                break;
            }
            case 'color': {
                const { ColorField } = await import('../form-components/color-field');
                nucleus = new ColorField(fieldDto.name, fieldDto.labels, fieldDto.id)
                    .setType('color')
                    .setRequired(fieldDto.required)
                    .setValue(fieldDto.value, true)
                    .addValueChangedListener(fieldDto.change);
                break;
            }
            default:
                throw new Error(`Unknown field type: ${fieldDto.type}`);
        }
        nucleus.setClasses(fieldDto.classes)
            .setLabels(fieldDto.labels)
            .setLabel(fieldDto.label)
            .setPlaceholder(fieldDto.placeholder)
            .setReadonly(fieldDto.readonly)
            .setValue(fieldDto.value, true)
            .setShowConditions(fieldDto.condition);

        return nucleus;
    }

    static async createOptionField(fieldDto: OptionFieldDto, prefix: string | undefined = undefined): Promise<Nucleus> {
        let nucleus: InputNucleus;
        switch (fieldDto.type) {
            case 'file': {
                const fileOptionFieldDto = fieldDto as FileOptionFieldDto;
                const { FileUploadField } = await import('../form-components/upload-field');
                nucleus = new FileUploadField(fieldDto.name, fieldDto.labels, fieldDto.id)

                    .setIsMultiple(fileOptionFieldDto.isMultiple)
                    .setAccept(fileOptionFieldDto.allowedExtensions)
                    .setMaxFiles(fileOptionFieldDto.maxFiles)
                    .setMaxFileSize(fileOptionFieldDto.maxFileSize)
                    .addValueChangedListener(fileOptionFieldDto.change);
                break;
            }
            case 'radio': {
                const { RadioField } = await import('../form-components/radio-field');
                nucleus = new RadioField(fieldDto.name, fieldDto.labels, fieldDto?.classes || '', fieldDto.id)
                    .addOptions(fieldDto.options)
                    .setReadonly(fieldDto.readonly)
                    .setValue(fieldDto.values, true)
                    .addValueChangedListener(fieldDto.change);
                break;
            }
            case 'checkbox': {
                const { CheckboxField } = await import('../form-components/checkbox-field');
                nucleus = new CheckboxField(fieldDto.name, fieldDto.labels, fieldDto?.classes || '', fieldDto.id)
                    .addOptions(fieldDto.options)
                    .setValue(fieldDto.values, true)
                    .addValueChangedListener(fieldDto.change);
                break;
            }
            case 'tag': {
                const { TagField } = await import('../form-components/tag-field');
                nucleus = new TagField(fieldDto.name, fieldDto.labels, fieldDto?.classes || '', fieldDto.id)
                    .addOptions(fieldDto.options)
                    .setValue(fieldDto.values, true)
                    .addValueChangedListener(fieldDto.change);
                break;
            }
            case 'select': {
                const { SelectField } = await import('../form-components/select-field');
                const selectField = new SelectField(fieldDto.name, fieldDto.labels, fieldDto?.classes || '', fieldDto.id)
                    .addOptions(fieldDto.options);

                selectField
                    .setValue(fieldDto.values, true)
                    .addValueChangedListener(fieldDto.change);
                nucleus = selectField;
                break;
            }
            case 'dual-listbox': {
                const { DualListboxField } = await import('../form-components/dual-listbox-field');
                nucleus = new DualListboxField(fieldDto.name, fieldDto.labels, fieldDto?.classes || '', fieldDto.id)
                    .addOptions(fieldDto.options)
                    .setValue(fieldDto.values, true)
                    .addValueChangedListener(fieldDto.change);
                break;
            }
        }

        nucleus
            .setType(fieldDto.type)
            .setClasses(fieldDto.classes)
            .setLabels(fieldDto.labels)
            .setLabel(fieldDto.label)
            .setRequired(fieldDto.required)
            .setPlaceholder(fieldDto.placeholder)
            .setReadonly(fieldDto.readonly)
            .setShowConditions(fieldDto.condition)
        return nucleus;
    }
}