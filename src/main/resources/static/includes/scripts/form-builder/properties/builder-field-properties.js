
import { Lang } from '../../shared/services/lang.js';
import { Operator, LogicalOperator } from '../../shared/condition-components/types/condition-types.js';
import { ValidationError } from '../../shared/errors/validation-error.js'

export class BuilderFieldProperties {
    properties = {};
    onPropertyLabelChanged = [];
    field
    constructor(field) {
        this.field = field;
    }

    /**
     * 
     * @param {*} properties 
     * @returns 
     */
    addProperties(properties) {
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
    addProperty(property) {
        if (
            property.type !== 'hidden' &&
            property.type !== 'string' &&
            property.type !== 'select' &&
            property.type !== 'number' &&
            property.type !== 'boolean' &&
            property.type !== 'options' &&
            property.type !== 'list' &&
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

        this.properties[property.id] = property;

        return this;
    }
 
    validateAll (field = null) {  
        for (const key in this.properties) {
            this.validate(this.properties[key], field);
        }
    }

    validate (property, field = null) {
        
        // Check for unique
        // It only checks in the group the field is in
        if (property.value && property.unique && this.field.getParent()) {
            const parentProperties = this.field.getParent().getChildFieldsPropertieById(property.id, property.value);

            if (parentProperties && parentProperties.length > 1) {
                const fieldName = `${field ? field.getLabel() : ''} - ${this.getFieldIdentifier()}`;
                throw new ValidationError(fieldName, `Het veld is niet uniek.`).setField(field);
            }
        }

        if (property.type == 'options') {
        } else if (property.type == 'list') {
            if (property.value) {
                for (const item of property.value) {
                    this.#validatePattern(item, property.pattern, property.message, field);
                }
            }
        } else if (property.type == 'condition') {
            this.#validateCondition (property.value, field);
        } else {
            this.#validatePattern(property.value, property.pattern, property.message, field);
        }
    }

    #validateCondition (condition, field = null) {

        if (!condition || Object.keys(condition).length === 0) {
            return;
        }
        
        const fieldName = `${field ? field.getLabel() : ''} - ${this.getFieldIdentifier()}`;
        if (condition.conditions && condition.conditions.length > 0) {
            if (!condition.logicalOperator || !Object.values(LogicalOperator).includes(condition.logicalOperator)) {
                throw new ValidationError(fieldName, "Fout in de logische operator van de conditie.").setField(field);
            }
        } else {
            if (!condition.operator || !Object.values(Operator).includes(condition.operator)) {
                throw new ValidationError(fieldName, "Fout in de operator van de conditie.").setField(field);
            }
        }
    }

    #validatePattern (value, pattern, message, field = null) {
        if (pattern && !pattern.test(value)) {
            console.warn('Validatie mislukt voor waarde:', "'" + value + "'", 'met patroon:', pattern, field);

            const fieldName = `${field ? field.getLabel() : ''} - ${this.getFieldIdentifier()}`;
            throw new ValidationError(fieldName, message).setField(field);
        }
    }
    
    addLabelChangedListener(callback) {
        if (typeof callback !== 'function') {
            throw new Error('callback moet een functie zijn');
        }

        this.onPropertyLabelChanged.push(callback);
        return this;
    }

    setPropertyValueById(id, value) {
        if (this.properties[id]) {
            this.properties[id].value = value;
        }
    }

    getPropertyById(id) {
        return this.properties[id];
    }

    hasProperty(id) {
        return id in this.properties;
    }

    getFieldIdentifier() {
        const propertyLabel = this.getPropertyValueById('label');
        const propertyName = this.getPropertyValueById('name');

        return propertyLabel && propertyLabel !== '' ? propertyLabel : propertyName && propertyName !== '' ? propertyName : Lang.get('prop.unknown.field');
    }

    getPropertyValueById(id) {
        const prop = this.getPropertyById(id);
        
        return prop === undefined ? undefined : prop.value;
    }

    getProperties(validate = false) {
        const entries = Object.entries(this.properties).map(([key, p]) => {
            if (validate) {
                this.validate(p);
            }
            
            return [p.id, p.value];
        });

        return Object.fromEntries(entries);
    }
}