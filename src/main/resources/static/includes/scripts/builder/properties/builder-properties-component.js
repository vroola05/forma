import { EventService } from '../../services/event-service.js';
import { BuilderPropertiesOptionsType } from './builder-properties-options-type.js';
import { BuilderPropertiesConditionType } from './builder-properties-condition-type.js';
import { Lang } from '../../util/lang.js';

export class BuilderPropertyComponent {
    content = document.createElement('div');
    fieldLabelContainer = document.createElement('div');
    fieldPropertiesContainer = document.createElement('div');
    onPropertyLabelChanged = null;
    
    constructor() {
        this.createContent();

        EventService.getInstance().addEventListener('properties-changed', (field) => {
            this.changeProperties(field);
        });
    }

    createContent() {
        this.content.className = 'builder-properties-container';

        const fieldPropertiesHeader = document.createElement('div');
        fieldPropertiesHeader.innerHTML = `<h2>${Lang.get('prop.header')}</h2>`;
        fieldPropertiesHeader.className = 'builder-field-properties';
        this.content.appendChild(fieldPropertiesHeader);

        this.fieldLabelContainer.className = 'builder-field-properties-label';
        this.content.appendChild(this.fieldLabelContainer);

        this.fieldPropertiesContainer.className = 'builder-field-properties-container';
        this.content.appendChild(this.fieldPropertiesContainer);
    }

    changeProperties(field) {
        this.field = field;

        if (field == null) {
            this.fieldLabelContainer.innerHTML = `<div></div>`;
            this.fieldPropertiesContainer.innerHTML = '';
        } else {
            if (field.label) {
                this.fieldLabelContainer.innerHTML = `<div>${field.label} - (${field.fieldProperties.getFieldIdentifier()})</div>`;
            }
            this.fieldPropertiesContainer.innerHTML = '';
            this.createPropertiesDom();
        }

        this.content.classList.add('active');
    }

    createPropertiesDom() {
        
        Object.entries(this.field.fieldProperties.properties).forEach(([id, property]) => {
            switch (property.type) {
                case 'options':
                    const builderPropertiesOptionsType = new BuilderPropertiesOptionsType(this.field, property, [
                            {label: Lang.get('prop.option.value'), value: 'value', type: 'text'},
                            {label: Lang.get('prop.option.text'), value: 'text', type: 'text'},
                            {label: '', value: 'selected', type: 'checkbox'}
                        ]);
                    this.fieldPropertiesContainer.appendChild(builderPropertiesOptionsType.getContent());
                    break;
                case 'list':
                    const builderPropertiesListType = new BuilderPropertiesOptionsType(this.field, property, [
                            {label: Lang.get('prop.list.text'), value: 'value', type: 'text'}
                        ]);
                    this.fieldPropertiesContainer.appendChild(builderPropertiesListType.getContent());
                    break;
                case 'condition':
                    const builderPropertiesConditionType = new BuilderPropertiesConditionType(this.field, property, [
                            {label: Lang.get('prop.list.text'), value: 'value', type: 'text'}
                        ]);
                    this.fieldPropertiesContainer.appendChild(builderPropertiesConditionType.getContent());
                    break;
                default:
                    this.getDefaultProperty(property);
                    break;
            }
        });
    }

    getDefaultProperty(property) {
        const wrapper = document.createElement('div');
        wrapper.className = 'row m-1 ';

        const label = document.createElement('label');
        label.textContent = property.label;
        label.htmlFor = `field-property-${property.id}`;
        label.className = 'col-sm-4 col-form-label';
        wrapper.appendChild(label);


        const inputWrapper = document.createElement('div');
        inputWrapper.className = 'col-sm-8';
        wrapper.appendChild(inputWrapper);

        const input = this.getPropertyDom(property);
        input.setAttribute('data-id', property.id);
        inputWrapper.appendChild(input);
        
        this.fieldPropertiesContainer.appendChild(wrapper);
    }

    getPropertyDom(property) {
        switch (property.type) {
            case 'string':
                return this.getPropertyStringDom(property);
            case 'number':
                return this.getPropertyNumberDom(property);
            case 'select':
                return this.getPropertySelectDom(property);
            case 'boolean':
                return this.getPropertyBooleanDom(property);
            default:
                console.warn('Onbekend property type:', property.type);
        }
        throw new Error('Onbekend property type: ' + property.type);
    }

    getPropertyBooleanDom(property) {
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.id = `field-property-${property.id}`;
        if (property.value === true) {
            input.checked = true;
        }
        input.placeholder = property.label;
        input.className = 'form-check-input';
        
        input.onchange = (event) => {
            property.value = event.target.checked;
            this.onPropertyChanged(event.target, property);
        };

        return input;
    }

    getPropertyNumberDom(property) {
        const input = document.createElement('input');
        input.type = 'number';
        input.id = `field-property-${property.id}`;
        input.value = property.value;
        input.placeholder = property.label;
        input.className = 'form-control';

        input.onchange = (event) => {
            if (typeof Number(event.target.value) !== 'number' || 'as', isNaN(event.target.value)) {
                console.warn('Value is not a number:', event.target.value);
                return;
            }
            property.value = Number(event.target.value);
            this.onPropertyChanged(event.target, property);
        };

        return input;
    }

    getPropertySelectDom(property) {
        const input = document.createElement('select');
        input.id = `field-property-${property.id}`;
        input.value = property.value;
        input.className = 'form-control';

        if (property.options) {
            property.options.forEach(option => {
                const optionElement = document.createElement('option');
                optionElement.value = option.value;
                optionElement.textContent = option.text;
                input.appendChild(optionElement);
            });
        }
        input.onchange = (event) => {
            
            if (this.field.fieldProperties.properties[event.target.dataset.id]) {
                this.field.fieldProperties.properties[event.target.dataset.id].value = event.target.value;
            }
            this.onPropertyChanged(event.target, property);
            
        };

        return input;
    }

    getPropertyStringDom(property) {
        const input = document.createElement('input');
        input.type = 'text';
        input.id = `field-property-${property.id}`;
        input.value = property.value;
        input.placeholder = property.label;
        input.className = 'form-control';

        input.onchange = (event) => {
            
            if (this.field.fieldProperties.properties[event.target.dataset.id]) {
                this.field.fieldProperties.properties[event.target.dataset.id].value = event.target.value;
            }
            this.onPropertyChanged(event.target, property);
            
        };

        return input;
    }

    onPropertyChanged(input, property) {
        input.classList.remove('is-invalid');
        try {
            this.field.fieldProperties.validate(property);
            if (property.id == 'label') {
                if (this.field.fieldProperties.onPropertyLabelChanged) {
                    this.field.fieldProperties.onPropertyLabelChanged.forEach(changed => {
                        changed(property.value);
                    });
                    
                }
            }
            
            EventService.getInstance().callEventListener('value-changed', this.field, property);
        } catch(error) {
            input.classList.add('is-invalid');
        }
    }

    getContent() {
        return this.content;
    }
}