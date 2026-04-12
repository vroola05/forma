import { BuilderFieldProperties } from "../properties/builder-field-properties.js";
import { Lang } from '../../shared/services/lang.js'

export class BuilderFieldInterface {
    fieldProperties = new BuilderFieldProperties(this);
    /**
     * A parent can for example be a group or tab
     */
    parent = null;
    onDragStart = null;
    onFieldPropertiesClicked = null;
    onFieldChanged = null;
    labelValue = null;

    constructor(type, label) {
        this.type = type;
        this.label = label;

        this.fieldProperties.addProperties([
            {type: 'hidden', id: 'id', label: 'ID', value: ''},
            {type: 'string', id: 'name', label: Lang.get('prop.name.label'), value: '', pattern: new RegExp("^(?=.{1,200}$)[a-z](?:[a-z0-9_-]*[a-z0-9])?$", "i"), message: Lang.get('prop.name.message'), unique: true},
            {type: 'string', id: 'label', label: Lang.get('prop.label.label'), value: '', pattern: new RegExp(".{0,200}$"), message: Lang.get('prop.name.message')},
            {type: 'string', id: 'classes', label: Lang.get('prop.class.label'), value: '', pattern: new RegExp(/^(?:(?=.{1,200}$)[-_a-z][-_a-z0-9]*(?:\s+[-_a-z][-_a-z0-9]*)*)?$/i), message: Lang.get('prop.class.message')},
            {type: 'list', id: 'metadata', label: Lang.get('prop.metadata.label'), value: [], pattern: new RegExp("^.{0,10}$"), message: Lang.get('prop.metadata.message')},
            {type: 'condition', id: 'condition', label: 'Show condities', value: {}}
        ]);

        this.fieldProperties.addLabelChangedListener((value) => {
            this.setLabel(this.fieldProperties.getFieldIdentifier());
        });

    }

    createContent(type, label) {
    }

    setLabel(value) {
    }

    getLabel() {
        return this.label;
    }

    getContent() {
    }

    getFieldIdentifier() {
        return this.fieldProperties.getFieldIdentifier();
    }

    setPropertyValueById(id, value) {
        this.fieldProperties.setPropertyValueById(id, value);
    }

    initDefaultProperties(properties) {
        if (!properties) {
            return;
        }
        for (const key in properties) {
            if (this.fieldProperties.hasProperty(key)) {
                this.fieldProperties.setPropertyValueById(key, properties[key]);
            }
        }

        this.fieldProperties.onPropertyLabelChanged.forEach(changed => {
            changed(properties.label);
        });
    }

    /**
     * Returns the parent field of an element.
     * @returns Field
     */
    getParent() {
        return this.parent;
    }

    /**
     * If an element is pushed in a dropzone you must set the parent element.
     * Otherwise you can't move an element from one group to another
     * @param {Field} parent - The parent of this specific element 
     * @returns 
     */
    setParent(parent) {
        this.parent = parent;
        return this;
    }


    /**
     * Returns an array with all the properties with a specific id. Optionally you can give a value so it filters on both. 
     * 
     * @param {*} id - identifier of the property you are looking for
     * @param {*} value - optional a the value of the specific property
     * @returns 
     */
    getChildFieldsPropertieById(id, value = undefined) {
        return this.getFields().filter(o => o.fieldProperties.properties[id] && (o.fieldProperties.properties[id].value == value))
                .map(o => o.fieldProperties.properties[id]);
    }

    /**
     * Method that can be implemented for container fields like tabs or groups
     * @returns 
     */
    getFields() {
        return null;
    }
}