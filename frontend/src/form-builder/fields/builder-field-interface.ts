
import { BuilderFieldProperties } from '../properties/builder-field-properties';
import { Lang } from '../../shared/services/lang'
import { BaseFieldDto, BuilderCondition, TranslationDto } from '../../shared/model/types';
import { ContitionService } from '../../shared/services/condition-service'
import { FieldProperty, FIELD_TYPE, PROPERTY_TYPE } from '../types';
import { Dropzone } from './components/dropzone';
import { BuilderPropertiesService } from '../services/builder-properties-service';
export class BuilderFieldInterface {
    fieldProperties = new BuilderFieldProperties(this);

    type: FIELD_TYPE;
    label: string;
    name: string;

    /**
     * A parent can for example be a group or tab
     */
    parent: BuilderFieldInterface | null = null;
    onDragStart: ((event: DragEvent) => void) | null = null;

    onFieldPropertiesClicked = null;
    onDeleteCallback: ((field: BuilderFieldInterface) => void) | null = null;
    labelValue = null;

    constructor(type: FIELD_TYPE, label: string) {
        this.type = type;
        this.label = label;
        this.name = '';

        this.fieldProperties.addProperties([
            { type: PROPERTY_TYPE.HIDDEN, id: 'id', order: 1, label: 'ID', value: '' },
            { type: PROPERTY_TYPE.STRING, id: 'name', order: 2, label: Lang.get('prop.name.label'), value: '', pattern: new RegExp("^(?=.{1,200}$)[a-z](?:[a-z0-9_-]*[a-z0-9])?$", "i"), message: Lang.get('prop.name.message'), unique: true },
            { type: PROPERTY_TYPE.LABEL, id: 'labels', order: 4, label: Lang.get('prop.label.label'), value: [] },
            { type: PROPERTY_TYPE.STRING, id: 'classes', order: 5, label: Lang.get('prop.class.label'), value: '', pattern: new RegExp(/^(?:(?=.{1,200}$)[-_a-z][-_a-z0-9]*(?:\s+[-_a-z][-_a-z0-9]*)*)?$/i), message: Lang.get('prop.class.message') },
            { type: PROPERTY_TYPE.CONDITION, id: 'condition', order: 20, label: 'Show condities', value: {} },
            { type: PROPERTY_TYPE.LIST, id: 'metadata', order: 21, label: Lang.get('prop.metadata.label'), value: [], pattern: new RegExp("^.{0,10}$"), message: Lang.get('prop.metadata.message') }
        ]);


        this.fieldProperties.addPropertyChangedListener('labels', (value: any) => {

            this.setLabel(this.fieldProperties.getFieldIdentifier());
            BuilderPropertiesService.setLabel(this.fieldProperties.getFieldIdentifier());
        });

        this.fieldProperties.addPropertyChangedListener('name', (value: any, pathOld: string) => {
            ContitionService.notify(pathOld, this.getPath());
        });
    }

    createContent(type: FIELD_TYPE, label: string) {
    }

    setLabel(value: string) {
        // Inherited
    }

    getLabel() {
        return this.label;
    }

    /**
     * Gives an unique name based on the children of the object. It checks getFields()
     * if there is another field with the name of the label and adds a number.
     * @param label 
     * @returns 
     */
    getUniqueLabel(label: string): string {
        const existingLabels = new Set(this.getFields()?.map(f => f.getDefaultLabel()) || []);
        return this.generateUniqueValue(label, existingLabels, ' ');
    }

    getUniqueName(label: string, property: string = 'name', cleanLabel: boolean = false, separator: string = '-'): string {

        const existingNames = new Set(this.getFields()?.map(f => f.getPropertyValueById(property)) || []);

        const baseLabel = cleanLabel
            ? label.toLowerCase().trim().replace(/\s+/g, separator)
            : label;

        return this.generateUniqueValue(baseLabel, existingNames, separator);
    }


    private generateUniqueValue(base: string, existingValues: Set<unknown>, separator: string): string {
        let index = 1;
        let newValue = `${base}${separator}${index}`;

        while (existingValues.has(newValue)) {
            index++;
            newValue = `${base}${separator}${index}`;
        }

        return newValue;
    }


    getDefaultLabel(input: TranslationDto[] | undefined = undefined): string {
        const labels = input ?? this.fieldProperties.getPropertyById('labels')?.value as TranslationDto[] | undefined;
        const locale = Lang.getDefaultLocale();

        if (!labels || !locale) return '';

        const currentLabel = labels.find(l => l.locale === locale);

        return currentLabel?.text ? currentLabel.text : '';
    }

    setDefaultLabel(label: string) {
        const labels = this.fieldProperties.getPropertyById('labels')?.value as TranslationDto[] | undefined;
        const locale = Lang.getDefaultLocale();

        if (!labels || !locale) return;

        const currentLabel = labels.find(l => l.locale === locale);

        if (currentLabel) {
            currentLabel.text = label;
        } else {
            labels.push({ locale, text: label });
        }
    }



    getContent(): HTMLElement | null {
        return null;
    }

    getFieldIdentifier() {
        return this.fieldProperties.getFieldIdentifier();
    }

    setPropertyValueById(id: string, value: any) {
        this.fieldProperties.setPropertyValueById(id, value);
    }

    getPropertyValueById(id: string) {
        return this.fieldProperties.getPropertyValueById(id);
    }

    initDefaultProperties(baseFieldDto: BaseFieldDto) {
        if (!baseFieldDto) {
            return;
        }

        const keys = Object.keys(baseFieldDto) as Array<keyof BaseFieldDto>;
        for (const key of keys) {
            const value = (baseFieldDto as Record<string, any>)[key];


            if (this.fieldProperties.hasProperty(key)) {

                if (key === 'condition') {
                    this.fieldProperties.setPropertyValueById(key, new BuilderCondition(baseFieldDto.condition));
                } else if (value !== undefined && value !== null) {
                    this.fieldProperties.setPropertyValueById(key, value);
                }
            }

        }

        this.setLabel(this.getDefaultLabel());
    }

    getPath(): string {
        return !this.parent ? `$.${this.getPropertyValueById('name')}`
            : `${this.parent.getPath()}.${this.getPropertyValueById('name')}`;

    }

    /**
     * Returns the parent field of an element.
     * @returns Field
     */
    getParent(): BuilderFieldInterface | null {
        return this.parent;
    }

    /**
     * If an element is pushed in a dropzone you must set the parent element.
     * Otherwise you can't move an element from one group to another
     * @param {Field} parent - The parent of this specific element 
     * @returns 
     */
    setParent(parent: BuilderFieldInterface) {
        this.parent = parent;
        return this;
    }

    // @TODO - implement in tab, group and repeating group
    getDropZone(): Dropzone | null {
        return null;
    }

    /**
     * Returns an array with all the properties with a specific id. Optionally you can give a value so it filters on both. 
     * 
     * @param {*} id - identifier of the property you are looking for
     * @param {*} value - optional a the value of the specific property
     * @returns 
     */
    getChildFieldsPropertieById(id: string, value: any = undefined): FieldProperty[] {
        const fields = this.getFields();
        if (!fields) return [];

        return fields.reduce<FieldProperty[]>((result, o) => {
            const prop = o.fieldProperties.getPropertyById(id);

            if (prop && prop.value === value) {
                result.push(prop);
            }

            return result;
        }, []);
    }

    getData(): any {

    }

    validate() {

    }

    /**
     * Method that can be implemented for container fields like tabs or groups
     * @returns 
     */
    getFields(): BuilderFieldInterface[] | null {
        return null;
    }

    /**
     * 
     * @param {*} errorMap 
     */
    handleValidationError(errorMap: any): any {
        const errorList = [];
        const errorListFields = [];
        for (const [key1, val1] of errorMap) {
            if (key1 === 'fields') {
                for (const [key2, val2] of val1) {
                    const index = Number(key2);
                    if (Number.isNaN(index)) {
                        continue;
                    }

                    // This ensures that the children are inserted
                    // after the parent
                    const fields = this.getFields();
                    if (fields && index < fields.length) {
                        const errorsChild = fields[index].handleValidationError(val2);
                        errorListFields.push(...errorsChild);
                    }
                }

                continue;
            }

            if (Array.isArray(val1)) {
                const fieldProperty = this.fieldProperties.getPropertyById(key1);

                errorList.push({
                    builderFieldInterface: this,
                    fieldProperty: fieldProperty,
                    errors: val1
                });
            }

        }

        errorList.push(...errorListFields)
        return errorList;
    }
}