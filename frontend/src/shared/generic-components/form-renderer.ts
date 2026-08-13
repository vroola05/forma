




import { Form, FormOptions } from '../form-components/form';
import { InputNucleus } from '../form-components/interface/input-base';
import { Nucleus } from '../form-components/interface/nucleus';
import { FieldDto, FileOptionFieldDto, FormDto, InputFieldDto, InputFieldType, OptionFieldDto, OptionFieldType } from '../model/types';



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
                return FormRenderer.#getFieldChildren(child);
            } else {
                return FormRenderer.#getField(child as InputNucleus);
            }
        });
    }

    static #getFieldChildren(child: Nucleus): any {
        return {
            name: child.name,
            label: child.label,
            type: child.type,
            id: child.id,
            fields: FormRenderer.#getFieldsData(child.getFields() || [])
        }
    }

    static #getField(field: InputNucleus): any {
        if (field.type === 'repeating-group') {
            // return {
            //     name: field.name,
            //     type: field.type,
            //     label: field.label,
            //     sets: field.groupInputSets.map(set: any[] => {
            //         return set.map(repField: any[] => {
            //             return {
            //                 name: repField.name,
            //                 type: repField.type,
            //                 value: !repField.hasOptions() ? repField.getValue() : '',
            //                 values: repField.hasOptions() ? repField.getOptions() : undefined,
            //                 label: repField.label,
            //                 classes: field.classes,
            //                 readonly: repField.readonly
            //             }
            //         })
            //     })
            // };
        } else if (field.type === 'file') {
            return {
                name: field.name,
                type: field.type,
                values: !field.getOptions() ? [] : field.getOptions(),
                label: field.label,
                classes: field.classes,
                readonly: field.readonly
            }
        } else {
            return {
                name: field.name,
                type: field.type,
                value: !field.hasOptions() ? field.getValue() : '',
                values: field.hasOptions() ? field.getOptions() : undefined,
                label: field.label,
                classes: field.classes,
                readonly: field.readonly
            }
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

        return form;
    }

    // static #createRepeatingSets(sets) {
    //     const repeatingSets = [];
    //     if (sets) {
    //         sets.forEach(set => {
    //             repeatingSets.push(FormRenderer.createFields(set));
    //         });
    //     }
    //     return repeatingSets;
    // }

    // static createFields(fields: any[]) {
    //     const fieldsInstances = [];
    //     fields.forEach(fieldDto => {
    //         const field = FormRenderer.createField(fieldDto);
    //         field.persistenceEnabled(true)
    //         fieldsInstances.push(field);
    //     });
    //     return fieldsInstances;
    // }

    static isInputType(type: string): type is InputFieldType {
        const inputs: InputFieldType[] = ['text', 'number', 'email', 'password', 'date', 'color', 'hidden', 'label', 'valuta', 'textarea'];
        return inputs.includes(type as InputFieldType);
    }

    static isOptionType(type: string): type is OptionFieldType {
        const options: OptionFieldType[] = ['checkbox', 'dual-listbox', 'radio', 'select', 'file'];
        return options.includes(type as OptionFieldType);
    }

    /**
     * 
     * @param fieldDto 
     * @returns 
     */
    static async createField(fieldDto: FieldDto): Promise<Nucleus> {
        if (this.isInputType(fieldDto.type)) {
            return await this.createInputField(fieldDto as InputFieldDto);
        } else if (this.isOptionType(fieldDto.type)) {
            return await this.createOptionField(fieldDto as OptionFieldDto);
        } else {
        
            switch (fieldDto.type) {
                
            
                case 'form-group': {
                    const { FormGroup } = await import( '../form-components/form-group');
                    const formGroup = new FormGroup(fieldDto, fieldDto.id);
                    await formGroup.init(fieldDto);
                    return formGroup;
                }
                case 'repeating-group':
                    // return new RepeatingGroup(fieldDto.name, fieldDto.label, fieldDto.classes, fieldDto.layout, dataField.id)
                    //     .setType(fieldDto.type)
                    //     
                    //     .setMinLength(fieldDto.minSize)
                    //     .setMaxLength(fieldDto.maxSize)
                    //     .registerSet(FormRenderer.createFields(fieldDto.fields))
                    //     .addSet(FormRenderer.#createRepeatingSets(fieldDto.sets))
                
                // Add more cases for other field types as needed
                    throw new Error('Repeating group is not implemented yet');
                default:
                    console.warn(`Unknown field type: ${fieldDto.type}`);
                    throw new Error('Repeating group is not implemented yet');
            }
        }
    }

    static async createInputField(fieldDto: InputFieldDto): Promise<Nucleus> {
        const { TextField } = await import( '../form-components/text-field');
        let nucleus: InputNucleus;
        switch (fieldDto.type) {
            case 'hidden': {
                const { HiddenField } = await import( '../form-components/hidden-field');
                nucleus = new HiddenField(fieldDto.name, fieldDto.label, fieldDto.id)
                    .setValue(fieldDto.value, true);
                break;
            }
            case 'label': {
                const { LabelField } = await import( '../form-components/label-field');
                nucleus = new LabelField(fieldDto.name, fieldDto.label, fieldDto.id)
                    .setRequired(fieldDto.required)
                break;
            }
            case 'text':
                
                nucleus = new TextField(fieldDto.name, fieldDto.label, fieldDto.id)
                    .setRequired(fieldDto.required)
                    .setMinLength(fieldDto.minlength)
                    .setMaxLength(fieldDto.maxlength)
                    .addValueChangedListener(fieldDto.change);
                break;
            case 'number':
                nucleus = new TextField(fieldDto.name, fieldDto.label, fieldDto.id)
                    .setType('number')
                    .setRequired(fieldDto.required)
                    .setMinLength(fieldDto.minlength)
                    .setMaxLength(fieldDto.maxlength)
                    .addValueChangedListener(fieldDto.change);
                break;
            case 'valuta': {
                const { ValutaField } = await import( '../form-components/valuta-field');
                nucleus = new ValutaField(fieldDto.name, fieldDto.label, fieldDto.id)
                    .setType('text')
                    .setRequired(fieldDto.required)
                    .setMinLength(fieldDto.minlength)
                    .setMaxLength(fieldDto.maxlength)
                    .addValueChangedListener(fieldDto.change);
                break;
            }
            case 'date': {
                const { DateField } = await import( '../form-components/date-field');
                nucleus = new DateField(fieldDto.name, fieldDto.label, fieldDto.id)
                    .setType('date')
                    .setRequired(fieldDto.required)
                    .setMinLength(fieldDto.minlength)
                    .setMaxLength(fieldDto.maxlength)
                    .addValueChangedListener(fieldDto.change);
                break;
            }
            case 'textarea': {
                const { TextAreaField } = await import( '../form-components/textarea-field');
                nucleus = new TextAreaField(fieldDto.name, fieldDto.label, fieldDto.id)
                    .setType('textarea')
                    .setRequired(fieldDto.required)
                    .setMinLength(fieldDto.minlength)
                    .setMaxLength(fieldDto.maxlength)
                    .addValueChangedListener(fieldDto.change);
                break;
            }
            case 'email':
                nucleus = new TextField(fieldDto.name, fieldDto.label, fieldDto.id)
                    .setType('email')
                    .setRequired(fieldDto.required)
                    .setMinLength(fieldDto.minlength)
                    .setMaxLength(fieldDto.maxlength)
                    .addValueChangedListener(fieldDto.change);
                break;
            case 'password': {
                const { PasswordField } = await import( '../form-components/password-field');
                nucleus = new PasswordField(fieldDto.name, fieldDto.label, fieldDto.id)
                    .setType('password')
                    .setRequired(fieldDto.required)
                    .setMinLength(fieldDto.minlength)
                    .setMaxLength(fieldDto.maxlength)
                    .addValueChangedListener(fieldDto.change);
                break;
            }
            case 'color': {
                const { ColorField } = await import( '../form-components/color-field');
                nucleus = new ColorField(fieldDto.name, fieldDto.label, fieldDto.id)
                    .setType('color')
                    .setRequired(fieldDto.required)
                    .setValue(fieldDto.value, true)
                    .addValueChangedListener(fieldDto.change);
                break;
            }
            default:
                console.warn(`Unknown field type: ${fieldDto.type}`);
                throw new Error('Field is not implemented yet');
        }
        nucleus.setClasses(fieldDto.classes)
                .setLabel(fieldDto.label)
                .setPlaceholder(fieldDto.placeholder)
                .setReadonly(fieldDto.readonly)
                .setValue(fieldDto.value, true)
                .setShowConditions(fieldDto.condition);

        return nucleus;
    }

    static async createOptionField(fieldDto: OptionFieldDto): Promise<Nucleus> {
        let nucleus: InputNucleus;
        switch (fieldDto.type) {
            case 'file': {
                const fileOptionFieldDto =  fieldDto as FileOptionFieldDto;
                const { FileUploadField } = await import( '../form-components/upload-field');
                nucleus =  new FileUploadField(fieldDto.name, fieldDto.label, fieldDto.id)
                    .setLabel(fieldDto.label)
                    .setIsMultiple(fileOptionFieldDto.isMultiple)
                    .setAccept(fileOptionFieldDto.allowedExtensions)
                    .setMaxFiles(fileOptionFieldDto.maxFiles)
                    .setMaxFileSize(fileOptionFieldDto.maxFileSize)
                    .addValueChangedListener(fileOptionFieldDto.change);
                break;
            }
            case 'radio': {
                const { RadioField } = await import( '../form-components/radio-field');
                nucleus = new RadioField(fieldDto.name, fieldDto.label, fieldDto?.classes || '', fieldDto.id)
                    .addOptions(fieldDto.options)
                    .setReadonly(fieldDto.readonly)
                    .setValue(fieldDto.value, true)
                    .addValueChangedListener(fieldDto.change);
                break;
            }
            case 'checkbox': {
                const { CheckboxField } = await import( '../form-components/checkbox-field');
                nucleus = new CheckboxField(fieldDto.name, fieldDto.label, fieldDto?.classes || '', fieldDto.id)
                    .addOptions(fieldDto.options)
                    .setValue(fieldDto.value, true)
                    .addValueChangedListener(fieldDto.change);
                break;
            }
            case 'select': {
                const { SelectField } = await import( '../form-components/select-field');
                const selectField = new SelectField(fieldDto.name, fieldDto.label, fieldDto?.classes || '', fieldDto.id)
                    .addOptions(fieldDto.options);

                selectField
                    .setValue(fieldDto.value, true)
                    .addValueChangedListener(fieldDto.change);
                nucleus = selectField;
                break;
            }
            case 'dual-listbox': {
                const { DualListboxField } = await import( '../form-components/dual-listbox-field');
                nucleus = new DualListboxField(fieldDto.name, fieldDto.label, fieldDto?.classes || '', fieldDto.id)
                    .addOptions(fieldDto.options)
                    .setValue(fieldDto.value, true)
                    .addValueChangedListener(fieldDto.change);
                break;
            }
        }

        nucleus
            .setType(fieldDto.type)
            .setClasses(fieldDto.classes)
            .setRequired(fieldDto.required)
            .setPlaceholder(fieldDto.placeholder)
            .setReadonly(fieldDto.readonly)
            .setShowConditions(fieldDto.condition)
        return nucleus;
    }
}