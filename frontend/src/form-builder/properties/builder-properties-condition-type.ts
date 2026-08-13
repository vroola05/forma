import { BuilderFieldInterface } from '../fields/builder-field-interface';
import { FieldProperty } from '../types';
import { BuilderPropertiesCondition } from './components/builder-properties-condition'
import { BuilderPropertiesFooter } from './components/builder-properties-footer';

/**
 * 
 */
export class BuilderPropertiesConditionType {
    content = document.createElement('div');
    builderPropertyOptionsContainer = document.createElement('div');
    
    field: BuilderFieldInterface;
    property: FieldProperty;
    valueDefault: any;
    onChanged: (dom: HTMLElement, property: FieldProperty) => void;

    builderPropertiesFooter: BuilderPropertiesFooter;
    builderPropertiesCondition: BuilderPropertiesCondition | null = null;

    constructor(
            field: BuilderFieldInterface,
            property: FieldProperty,
            valueDefault: any,
            onChanged: (dom: HTMLElement, property: FieldProperty) => void) {

        this.field = field;
        this.property = property;
        this.valueDefault = valueDefault;
        this.onChanged = onChanged;


        this.content.className = 'builder-properties-condition-container';

        const fieldPropertiesHeader = document.createElement('div');
        fieldPropertiesHeader.className = 'builder-field-properties';
        this.content.appendChild(fieldPropertiesHeader);

        const propertiesHeader = document.createElement('h3');
        propertiesHeader.innerHTML = `${this.property.label}`;
        fieldPropertiesHeader.appendChild(propertiesHeader);

        const propertiesHeaderBtns = document.createElement('div');
        propertiesHeaderBtns.className = 'builder-properties-header-btns';
        fieldPropertiesHeader.appendChild(propertiesHeaderBtns);

        const propertiesHeaderBtnExpand = document.createElement('button');
        propertiesHeaderBtnExpand.className = 'builder-btn-icon icon icon-arrows-angle-expand';
        propertiesHeaderBtns.appendChild(propertiesHeaderBtnExpand);
        propertiesHeaderBtnExpand.addEventListener('click', (e) => {

        });

        const keyValueContainer = document.createElement('div');
        keyValueContainer.className = 'builder-properties-condition-content-container';
        this.content.appendChild(keyValueContainer);

        this.builderPropertyOptionsContainer.className = 'builder-property-content-container';
        this.builderPropertyOptionsContainer.innerHTML = '';
        keyValueContainer.appendChild(this.builderPropertyOptionsContainer);
        
        this.builderPropertiesFooter = new BuilderPropertiesFooter('Conditie toevoegen')
                .addButton('add', '', 'builder-properties-btn-add', () => {
                    if (!this.builderPropertiesCondition) {
                        this.addCondition();
                        this.builderPropertiesFooter.show(false);
                    }
                });
        this.content.appendChild(this.builderPropertiesFooter.getContent());

        if (this.property.value && Object.keys(this.property.value).length > 0) {
            this.addCondition(this.property.value)
        }
    }

    addCondition(conditionData = undefined) {
        this.builderPropertiesCondition = new BuilderPropertiesCondition(
            conditionData,
            (value: any) => {
                this.property.value = value;
                if (this.onChanged) {
                    this.onChanged(this.content, this.property);
                }
            },
            () => {
                this.property.value = null;
                this.builderPropertyOptionsContainer.innerHTML = '';
                this.builderPropertiesCondition = null;
                this.builderPropertiesFooter.show(true);
                
                if (this.onChanged) {
                    this.onChanged(this.content, this.property);
                }
            });

        this.builderPropertyOptionsContainer.appendChild(this.builderPropertiesCondition.getContent());
    }

    getContent() {
        return this.content;
    }
}