import { EventService } from '../../shared/services/event-service';
import { Lang } from '../../shared/services/lang';
import { WindowFrame } from '../component/window-frame';
import { BuilderFieldInterface } from '../fields/builder-field-interface';
import { BuilderPropertiesService } from '../services/builder-properties-service';
import { FIELD_TYPE, FieldProperty } from '../types';
import { BuilderPropertiesConditionType } from './builder-properties-condition-type';
import { BuilderPropertiesLabelType } from './builder-properties-label-type';
import { BuilderPropertiesOptionsType } from './builder-properties-options-type';

/**
 * 
 */
export class BuilderPropertyComponent {
    content = document.createElement('div');
    
    
    subscriptions: (() => void)[] = [];
    field: BuilderFieldInterface | undefined = undefined;
    windowFrame: WindowFrame;

    #onFieldChanged: ((field: BuilderFieldInterface | undefined) => void) | undefined;

    constructor() {
        this.windowFrame = new WindowFrame(Lang.get('prop.header'));
        this.windowFrame.hide();
        this.windowFrame.setContent(this.content);
        
        this.content.className = 'builder-properties-container';

        this.subscriptions.push(BuilderPropertiesService.subscribe((field: BuilderFieldInterface | undefined) => {
            
            this.changeProperties(field);
            if (this.#onFieldChanged) {
                this.#onFieldChanged(field);
            }
            if (BuilderPropertiesService.hasValidationErrors()) {
                const error = BuilderPropertiesService.getValidationErrors();
                this.setValidationErrors(error.fieldProperty, error.errors);
            }
        }));

        this.subscriptions.push(BuilderPropertiesService.subscribeLabel((label: string | undefined) => {
            this.setLabel();
        }));
    }

    destroy() {
        for(const unsubscribe of this.subscriptions) {
            unsubscribe();
        }
        this.subscriptions = [];
    }

    changeProperties(field: BuilderFieldInterface | undefined) {
        this.field = field;

        this.content.innerHTML = '';

        if (!field) {
            this.windowFrame.hide();
            return;
        }
        this.setLabel();
    
        this.createPropertiesDom();
        this.windowFrame.show();
    }

    onFieldChanged(callback: (field: BuilderFieldInterface | undefined) => void) {
        this.#onFieldChanged = callback;
    }

    setLabel() {
        if (!this.field) {
            this.windowFrame.setLabel(Lang.get('prop.header'));
        } else {
            const fieldIdentifier = this.field.fieldProperties.getFieldIdentifier();
            if (fieldIdentifier === this.field.label) {
                this.windowFrame.setLabel(`${this.field.label}`);
            } else {
                this.windowFrame.setLabel(`${this.field.label} - (${fieldIdentifier})`);
            }
        }
    }

    createPropertiesDom() {
        if (!this.field) {
            return
        }

        const field = this.field;
        Array.from(field.fieldProperties.properties.entries()).sort(([idA, propA], [idB, propB]) => {
            const orderA = propA.order ?? Infinity;
            const orderB = propB.order ?? Infinity;
            return orderA - orderB;
        })
        .forEach(([id, property]) => {
            switch (property.type) {
                case 'options': {
                    const builderPropertiesOptionsType = new BuilderPropertiesOptionsType(field, property, [
                            {label: Lang.get('prop.option.value'), value: 'value', type: FIELD_TYPE.TEXT},
                            {label: Lang.get('prop.option.text'), value: 'text', type: FIELD_TYPE.TEXT},
                            {label: '', value: 'selected', type: FIELD_TYPE.CHECKBOX}
                        ]);
                    this.content.appendChild(builderPropertiesOptionsType.getContent());
                    break;
                }
                case 'label': {
                    const builderPropertiesOptionsType = new BuilderPropertiesLabelType(field, property);
                    this.content.appendChild(builderPropertiesOptionsType.getContent());
                    break;
                }
                case 'list': {
                    const builderPropertiesListType = new BuilderPropertiesOptionsType(field, property, [
                            {label: Lang.get('prop.list.text'), value: 'value', type: FIELD_TYPE.TEXT}
                        ]);
                    this.content.appendChild(builderPropertiesListType.getContent());
                    break;
                }
                case 'condition': {
                    const builderPropertiesConditionType = new BuilderPropertiesConditionType(field, property, [
                            {label: Lang.get('prop.list.text'), value: 'value', type: FIELD_TYPE.TEXT}
                        ],
                        (dom: HTMLElement, property: FieldProperty) => {
                            this.onPropertyChanged(dom, property);
                        });

                    this.content.appendChild(builderPropertiesConditionType.getContent());
                    break;
                }
                default:
                    this.getDefaultProperty(property);
                    break;
            }
        });
    }

    getDefaultProperty(property: FieldProperty) {
        const builderProperties = document.createElement('div');
        builderProperties.className = 'builder-properties';

        const label = document.createElement('label');
        label.textContent = property.label;
        label.htmlFor = `field-property-${property.id}`;
        label.className = 'builder-properties-label';
        builderProperties.appendChild(label);


        const builderPropertiesFieldWrapper = document.createElement('div');
        builderPropertiesFieldWrapper.className = 'builder-properties-field-wrapper';
        builderProperties.appendChild(builderPropertiesFieldWrapper);

        const builderPropertiesField = document.createElement('div');
        builderPropertiesField.className = 'builder-properties-field';

        const input = this.getPropertyDom(property);
        input.dataset.id = property.id;
        
        const inputErrors = document.createElement('div');
        inputErrors.className = 'invalid-feedback';
        
        builderPropertiesField.append(input);
        builderPropertiesFieldWrapper.append(builderPropertiesField, inputErrors);
        this.content.appendChild(builderProperties);
    }

    getPropertyDom(property: FieldProperty) {
        switch (property.type) {
            case 'hidden':
                return this.getPropertyHiddenDom(property);
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

    getPropertyBooleanDom(property: FieldProperty) {
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.id = `field-property-${property.id}`;
        if (property.value === true) {
            input.checked = true;
        }
        input.placeholder = property.label;
        input.className = 'form-check-input';
        
        input.onchange = (event) => {
            const target = event.target as HTMLInputElement
            property.value = target.checked;
            this.onPropertyChanged(target, property);
        };

        return input;
    }

    getPropertyNumberDom(property: FieldProperty) {
        const input = document.createElement('input');
        input.type = 'number';
        input.id = `field-property-${property.id}`;
        input.value = property.value;
        input.placeholder = property.label;
        input.className = 'form-control';

        input.onchange = (event) => {
            const target = event.target as HTMLInputElement;

            if (Number.isNaN(Number(target.value))) {
                console.warn('Value is not a number:', target.value);
                return;
            }

            property.value = Number(target.value);
            this.onPropertyChanged(target, property);
        };

        return input;
    }

    getPropertySelectDom(property: FieldProperty) {
        const input = document.createElement('select');
        input.id = `field-property-${property.id}`;
        input.className = 'form-control';

        const optionElement = document.createElement('option');
        optionElement.value = '-1';
        optionElement.textContent = `${Lang.get('prop.select.placeholder')} ${property.label}`;
        input.appendChild(optionElement);

        if (property.options) {
            property.options.forEach(option => {
                const optionElement = document.createElement('option');
                optionElement.value = option.value;
                optionElement.textContent = option.text;
                input.appendChild(optionElement);
            });
        }

        input.value = property.value;

        input.onchange = (event) => {
            const target = event.target as HTMLInputElement;
            const id = target?.dataset?.id;
            if (id) {
                const prop = this.field?.fieldProperties?.properties.get(id);
                if (prop) {
                    prop.value = target.value === '-1' ? '' : target.value;
                    this.onPropertyChanged(target, prop);
                }
            }
        };

        return input;
    }

    getPropertyHiddenDom(property: FieldProperty) {
        const input = document.createElement('input');
        input.type = 'text';
        input.id = `field-property-${property.id}`;
        input.value = property.value;
        input.className = 'form-control';
        input.readOnly = true;
        input.disabled = true;

        return input;
    }

    getPropertyStringDom(property: FieldProperty) {
        const input = document.createElement('input');
        input.type = 'text';
        input.id = `field-property-${property.id}`;
        input.value = property.value;
        input.placeholder = property.label;
        input.className = 'form-control';

        input.onchange = (event) => {
            const target = event.target as HTMLInputElement;
            const id = target?.dataset?.id;
            if (id) {
                const prop = this.field?.fieldProperties?.properties.get(id);
                if (prop) {
                    const valueOld = this.field?.getPath(); //prop.value;
                    prop.value = target.value;
                    this.onPropertyChanged(target, prop, valueOld);

                    if (!this.validate(prop, target)) {
                        return;
                    }
                }
            }
        };

        return input;
    }

    validate(property: FieldProperty, input: HTMLInputElement) {
        input.classList.remove('is-invalid');
        const feedback = input.parentElement?.querySelector('.invalid-feedback')

        if (feedback) {
            feedback.innerHTML = '';
        }
        try {
            this.field?.fieldProperties.validate(property, undefined);
        } catch(error) {
            input.classList.add('is-invalid');
            if (feedback && error instanceof Error) {
                feedback.innerHTML = error.message;
            }
            return false;
        }
        return true;
    }

    setValidationErrors(property: FieldProperty, errors: string[]) {
        if (!property) {
            return;
        }
        const input = document.getElementById(`field-property-${property.id}`);
        if (input) {
            input.classList.remove('is-invalid');
            const feedback = input.parentElement?.querySelector('.invalid-feedback');
            if (feedback) {
                feedback.innerHTML = `${errors.join(' ')}`;
            }
            
            input.classList.add('is-invalid');
        }
    }

    onPropertyChanged(input: HTMLElement, property: FieldProperty, valueOld: any = undefined) {
        input.classList.remove('is-invalid');
        try {

            // Place all onProperyChanged before the value-changed
            // so the changes will be saved
            this.field?.fieldProperties?.onPropertyChanged
                    .get(property.id)?.forEach((callback: (value: any, valueOld: any) => void) => callback(property.value, valueOld));

            EventService.emit('value-changed', this.field);
        } catch(error) {
            input.classList.add('is-invalid');
        }
    }

    getContent() {
        return this.windowFrame.getContent();
    }
}