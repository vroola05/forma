import { BuilderPropertiesCondition } from './components/builder-properties-condition.js'
import { BuilderPropertiesFooter } from './components/builder-properties-footer.js';

/**
 * 
 */
export class BuilderPropertiesConditionType {
    dropzone = null;

    constructor(field, property, valueDefault, onChanged) {
        this.field = field;
        this.property = property;
        this.valueDefault = valueDefault;
        this.onChanged = onChanged;
        this.createContent();
    }

    createContent() {
        this.content = document.createElement('div');
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

        this.builderPropertyOptionsContainer = document.createElement('div');
        this.builderPropertyOptionsContainer.className = 'builder-property-content-container';
        this.builderPropertyOptionsContainer.innerHTML = '';
        keyValueContainer.appendChild(this.builderPropertyOptionsContainer);
        
        this.builderPropertiesFooter = new BuilderPropertiesFooter('Conditie toevoegen')
                .addButton('add', '', 'builder-properties-btn-add', (event) => {
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
            (value) => {
                this.property.value = value;
                if (this.onChanged) {
                    this.onChanged(this.content, this.property);
                }
            },
            () => {
                this.property.value = null;
                this.builderPropertyOptionsContainer.innerHTML = '';
                this.builderPropertiesCondition = undefined;
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