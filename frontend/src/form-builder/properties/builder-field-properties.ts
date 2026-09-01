
import { ValidationError } from '../../shared/errors/validation-error';
import { BuilderCondition, LogicalOperator, Operator, TranslationDto } from '../../shared/model/types';
import { Lang } from '../../shared/services/lang';
import { BuilderFieldInterface } from '../fields/builder-field-interface';
import { FieldProperty } from '../types';

export class BuilderFieldProperties {
    properties: Map<string, FieldProperty> = new Map();
    onPropertyChanged = new Map();

    field: BuilderFieldInterface;
    
    constructor(field: BuilderFieldInterface) {
        this.field = field;
    }

    /**
     * 
     * @param {*} properties 
     * @returns 
     */
    addProperties(properties: FieldProperty[]) {
        if (!Array.isArray(properties)) {
            throw new Error('properties moet een array zijn van {id: string, label: string, value: string}');
        }

        properties.forEach(property => this.addProperty(property));
        return this;
    }

    /**
     * 
     * @param {*} property : {id: string, label: string, value: string}
     */
    addProperty(property: FieldProperty) {
        if (
            property.type !== 'hidden' &&
            property.type !== 'string' &&
            property.type !== 'select' &&
            property.type !== 'number' &&
            property.type !== 'boolean' &&
            property.type !== 'options' &&
            property.type !== 'list' &&
            property.type !== 'label' &&
            property.type !== 'condition') {
            throw new Error('property.type moet een van de volgende waarden hebben: string, number, boolean');
        }
        if (
            typeof property !== 'object' ||
            typeof property.id !== 'string' ||
            typeof property.label !== 'string'
        ) {
            throw new Error('property moet een object zijn met {id: string, label: string}');
        }

        this.properties.set(property.id, property);

        return this;
    }
 
    validateAll (field: BuilderFieldInterface | undefined = undefined) {  
        for (const fieldProperty of this.properties.values()) {
            this.validate(fieldProperty, field);
        }
   }

    validate (property: FieldProperty, field: BuilderFieldInterface | undefined = undefined) {
        // Check for unique
        // It only checks in the group the field is in
        if (field && property.value && property.unique && this.field.getParent()) {
            const parentProperties = this.field.getParent()?.getChildFieldsPropertieById(property.id, property.value);
            
            if (parentProperties && parentProperties.length > 1) {
                const fieldName = `${field ? field.getLabel() : ''} - ${this.getFieldIdentifier()}`;
                throw new ValidationError(fieldName, `Het veld is niet uniek.`).setField(field);
            }
        }
        if (property.type === 'label') {
            this.#validateTranslation(property.value, field);
        }
        if (property.type === 'options') {
            console.warn('Not yet implemented')
        } else if (property.type === 'list') {
            if (property.value) {
                for (const item of property.value) {
                    this.#validatePattern(item, property.pattern, property.message, field);
                }
            }
        } else if (property.type === 'condition') {
            this.#validateCondition (property.value, field);
        } else {
            
            this.#validatePattern(property.value, property.pattern, property.message, field);
        }
    }

    #validateTranslation(translations: TranslationDto[], field: BuilderFieldInterface | undefined) {
        if (translations === undefined || translations.length === 0 || field === undefined) {
            return;
        }

        const fieldName = `${field ? field.getLabel() : ''} - ${this.getFieldIdentifier()}`;

        const locales = translations.map(t => t.locale);
        if (locales.some(locale => !locale || locale.trim() === '')) {
            
            throw new ValidationError(fieldName, Lang.get('prop.labels.locale.empty.message')).setField(field);
        }
        const uniqueLocales = new Set(locales);
        if (uniqueLocales.size !== translations.length) {
            const duplicate = locales.find((item, index) => locales.indexOf(item) !== index);
            throw new ValidationError(fieldName, Lang.get('prop.labels.locale.duplicate.message', duplicate?? '')).setField(field);
        }
    }

    #validateCondition (condition: BuilderCondition | undefined, field: BuilderFieldInterface | null = null) {
        if (!condition || Object.keys(condition).length === 0 || !field) {
            return;
        }
        
        const fieldName = `${field ? field.getLabel() : ''} - ${this.getFieldIdentifier()}`;
        if (condition.conditions && condition.conditions.length > 0) {
            if (condition.logicalOperator === undefined || !Object.values(LogicalOperator).includes(condition.logicalOperator)) {
                throw new ValidationError(fieldName, "Fout in de logische operator van de conditie.").setField(field);
            }
        } else if (condition.operator === undefined || !Object.values(Operator).includes(condition.operator)) {
            throw new ValidationError(fieldName, "Fout in de operator van de conditie.").setField(field);
        }
    }

    #validatePattern (value: any, pattern: RegExp | undefined, message: string | undefined, field: BuilderFieldInterface | null = null) {
        if (field && pattern && !pattern.test(value)) {
            const fieldName = `${field ? field.getLabel() : ''} - ${this.getFieldIdentifier()}`;
            throw new ValidationError(fieldName, message ? message : '').setField(field);
        }
    }
    
    addPropertyChangedListener(propertyName: string, callback: (value: any, pathOld: string) => void) {
        if (!this.onPropertyChanged.has(propertyName)) {
            this.onPropertyChanged.set(propertyName, []);
        }
        this.onPropertyChanged.get(propertyName).push(callback);
    }

    setPropertyValueById(id: string, value: any) {
        if (!this.properties.has(id)) {
            return;
        }

        const property = this.properties.get(id);
        if (property) {
            property.value = value ? value : '';
        }
    }

    getPropertyValueById(id: string) {
        const prop = this.getPropertyById(id);
        return prop === undefined ? undefined : prop.value;
    }

    getPropertyById(id: string) {
        return this.properties.get(id);
    }

    hasProperty(id: string) {
        return this.properties.has(id);
    }

    getFieldIdentifier() {
        const propertyLabel = this.getPropertyValueById('labels') as TranslationDto[];
        const propertyName = this.getPropertyValueById('name');
        if (propertyLabel === undefined || propertyLabel.length === 0) {
            return propertyName !== '' ? propertyName : Lang.get('prop.unknown.field');
        }
        
        const defaultLocale = Lang.getDefaultLocale();

        const identifier = propertyLabel.find(label => label.locale === defaultLocale);

        return identifier !== undefined ? identifier?.text : propertyLabel[0].text;
    }

    getProperties(validate = false) {
        const entries = Array.from(this.properties, ([key, p]) => {
            if (validate) {
                this.validate(p);
            }
            return [p.id, p.value];
        });

        return Object.fromEntries(entries);
    }
}