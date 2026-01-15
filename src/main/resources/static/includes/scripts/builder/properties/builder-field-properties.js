
import { Lang } from '../../util/lang.js';
export class BuilderFieldProperties {
    
    properties = {};
    onPropertyLabelChanged = [];

    constructor() {
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
            property.type !== 'string' &&
            property.type !== 'select' &&
            property.type !== 'number' &&
            property.type !== 'boolean' &&
            property.type !== 'options' &&
            property.type !== 'list') {
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
            console.log('Validating property:', field.label, key, this.properties[key]);
            this.validate(this.properties[key], field);
        }
    }

    validate (property, field = null) {
        if (property.type == 'options') {
        } else if (property.type == 'list') {
            if (property.value) {
                for (const item of property.value) {
                    this.#validatePattern(item, property.pattern, property.message, field);
                }
            }
        } else {
            this.#validatePattern(property.value, property.pattern, property.message, field);
        }
    }

    #validatePattern (value, pattern, message, field = null) {
        if (pattern && !pattern.test(value)) {
            console.warn('Validatie mislukt voor waarde:', "'"+value+"'", 'met patroon:', pattern, field);

            const fieldName = `${field ? field.getLabel() : ''} - ${this.getFieldIdentifier()}`;
            throw new Error(fieldName + " - " + message);
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

        console.log('Getting field identifier:', propertyLabel && propertyLabel !== '', propertyName && propertyName !== '');
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