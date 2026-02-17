import { BuilderFieldProperties } from "../properties/builder-field-properties.js";
import { Lang } from '../../shared/services/lang.js'

export class BuilderFieldInterface {
    fieldProperties = new BuilderFieldProperties();

    onDragStart = null;
    onFieldPropertiesClicked = null;
    onFieldChanged = null;
    labelValue = null;

    constructor(type, label) {
        this.type = type;
        this.label = label;


        this.fieldProperties.addProperties([
            {type: 'string', id: 'name', label: Lang.get('prop.name.label'), value: '', pattern: new RegExp("^(?=.{1,200}$)[a-z](?:[a-z0-9_-]*[a-z0-9])?$", "i"), message: Lang.get('prop.name.message')},
            {type: 'string', id: 'label', label: Lang.get('prop.label.label'), value: '', pattern: new RegExp(".{0,200}$"), message: Lang.get('prop.name.message')},
            {type: 'string', id: 'classes', label: Lang.get('prop.class.label'), value: '', pattern: new RegExp("^(?:(?=.{1,200}$)[a-z][a-z0-9_-]*(?:\s+[a-z][a-z0-9_-]*)*)?$", "i"), message: Lang.get('prop.class.message')},
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
}