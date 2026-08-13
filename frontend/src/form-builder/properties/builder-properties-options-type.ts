import { EventService } from '../../shared/services/event-service'
import { BuilderFieldInterface } from '../fields/builder-field-interface';
import { FIELD_TYPE, FieldProperty, FieldPropertyOption } from '../types';
import { BuilderPropertiesFooter } from './components/builder-properties-footer';

/**
 * 
 */
export class BuilderPropertiesOptionsType {
    content = document.createElement('div');
    builderPropertyOptionsContainer = document.createElement('div');

    dropzone = null;

    draggedItem: HTMLElement | null = null;

    field: BuilderFieldInterface;
    property: FieldProperty;
    optionDefinition: FieldPropertyOption[];

    constructor(field: BuilderFieldInterface, property: FieldProperty, optionDefinition: FieldPropertyOption[]) {
        this.field = field;
        this.property = property;
        this.optionDefinition = optionDefinition;

        this.createContent();
    }

    createContent() {
        this.content.className = 'builder-properties-options-container';

        const fieldPropertiesHeader = document.createElement('div');
        fieldPropertiesHeader.innerHTML = `<h3>${this.property.label}</h3>`;
        fieldPropertiesHeader.className = 'builder-field-properties';
        this.content.appendChild(fieldPropertiesHeader);

        const keyValueContainer = document.createElement('div');
        keyValueContainer.className = 'builder-properties-options-content-container';
        this.content.appendChild(keyValueContainer);
        
        const keyValueTheadHeader = document.createElement('div');
        keyValueTheadHeader.className = 'options-head';
        keyValueContainer.appendChild(keyValueTheadHeader);


        const keyValueColValueHeader = document.createElement('div');
            keyValueColValueHeader.className = 'options-type-col-header';
            keyValueColValueHeader.innerHTML = '';
            keyValueTheadHeader.appendChild(keyValueColValueHeader);

        this.optionDefinition.forEach(def => {
            const keyValueColValueHeader = document.createElement('div');
            keyValueColValueHeader.className = 'options-type-col-header';
            keyValueColValueHeader.innerHTML = def.label;
            keyValueTheadHeader.appendChild(keyValueColValueHeader);
        });

        this.builderPropertyOptionsContainer.className = 'builder-property-options-container';
        this.builderPropertyOptionsContainer.innerHTML = '';
        keyValueContainer.appendChild(this.builderPropertyOptionsContainer);
        

        const builderPropertiesFooter = new BuilderPropertiesFooter('Item toevoegen')
                .addButton('add', '', 'builder-properties-btn-add', () => {
                    this.addRowNew();
                });
        this.content.appendChild(builderPropertiesFooter.getContent());

        if (this.property.value) {
            const length = this.property.value.length;
            for (let i = 0; i < length; i++) {
                this.addRow(i, this.property.value[i]);
            }
        }

        this.builderPropertyOptionsContainer.addEventListener("dragover", (event) => {
            event.preventDefault();

            this.builderPropertyOptionsContainer.classList.add('drag-over');
        });

        this.builderPropertyOptionsContainer.addEventListener('dragleave', (event) => {
            event.preventDefault();

            this.builderPropertyOptionsContainer.classList.remove('drag-over');
        });

        this.builderPropertyOptionsContainer.addEventListener("drop", (event) => {
            event.preventDefault();

            this.builderPropertyOptionsContainer.classList.remove('drag-over');
            if (this.draggedItem == null) {
                return;
            }

            if (!this.draggedItem.classList.contains('builder-property-option-item')) {
                return;
            }

            const target = event.target as HTMLElement;
            let droppedItem = target.closest('.builder-property-option-item');
            if (droppedItem && !this.builderPropertyOptionsContainer.contains(droppedItem)) {
                droppedItem = null;
            }

            this.moveItem(this.draggedItem, droppedItem);

            this.draggedItem = null;
        });

    }

    moveItem(draggedItem: HTMLElement, droppedItem: Element | null) {
        const list = Array.from(this.builderPropertyOptionsContainer.children);
        if (draggedItem === droppedItem) return;

        let draggedIndex = list.findIndex(tabLabel => tabLabel === draggedItem);
        let droppedIndex = null;
        
        if (droppedItem == null) {
            this.builderPropertyOptionsContainer.appendChild(draggedItem);
        } else {
            droppedIndex = list.findIndex(tabLabel => tabLabel === droppedItem);
            if (draggedIndex < droppedIndex) {
                this.builderPropertyOptionsContainer.insertBefore(draggedItem, droppedItem.nextSibling);
            } else {
                this.builderPropertyOptionsContainer.insertBefore(draggedItem, droppedItem);
            }
            
        }
        this.setOptions();
    }

    addRowNew() {
        const index = this.property.value.length;

        const value  = this.optionDefinition.length == 1 ? '' : this.optionDefinition.reduce((obj: Record<string, string | boolean>, def) => {
            obj[def.value] = def.type === 'checkbox' ? false : '';
            return obj;
        }, {});
        this.property.value.push(value);
        this.addRow(index, value)
        
    }

    addRow(index: number, value: any) {
        const builderPropertyOptionItem = document.createElement('div');
        builderPropertyOptionItem.className = 'builder-property-option-item icon icon-grip-vertical';
        builderPropertyOptionItem.setAttribute('data-id', this.property.id);
        builderPropertyOptionItem.setAttribute('draggable', 'true');
        builderPropertyOptionItem.addEventListener("dragstart", (event) => {
            this.draggedItem = event.currentTarget as HTMLElement;
        });
        
        this.builderPropertyOptionsContainer.appendChild(builderPropertyOptionItem);

        for (let i=0; i < this.optionDefinition.length; i++) {
            builderPropertyOptionItem.appendChild(this.getInputCol(
                this.optionDefinition[i].type,
                this.optionDefinition[i].label,
                this.optionDefinition[i].value,
                this.optionDefinition.length == 1 ? this.property.value[index] : this.property.value[index][this.optionDefinition[i].value],
                this.optionDefinition[i].type !== 'checkbox'));
        }

        const builderPropertyOptionItemDeleteContainer = document.createElement('div');
        builderPropertyOptionItemDeleteContainer.className = 'options-type-col builder-properties-button-container';
        builderPropertyOptionItem.appendChild(builderPropertyOptionItemDeleteContainer);
    
        const builderPropertyOptionItemDelete = document.createElement('button');
        builderPropertyOptionItemDelete.className = 'builder-btn-icon icon icon-x-lg';

        builderPropertyOptionItemDeleteContainer.appendChild(builderPropertyOptionItemDelete);
        builderPropertyOptionItemDeleteContainer.onclick = (event) => {
            const target = event.target as HTMLElement;
            let rowContainer = target.closest('.builder-property-option-item');
            if (rowContainer) {
                this.builderPropertyOptionsContainer.removeChild(rowContainer);
                this.setOptions();
            }
        }
    }

    getInputCol(type: FIELD_TYPE, placeholder: string, key: string, value: string, flex = true) {
        const column = document.createElement('div');
        column.className = 'options-type-col' + (flex ? ' input-col' : '');
        const input = document.createElement('input');
        input.type = type;
        input.value = value;
        input.placeholder = placeholder;
        input.name = key;
        input.className = 'form-control' + (type !=='checkbox' ? '' : ' form-check-input');
        input.setAttribute('data-key', key);
        
        column.appendChild(input);

        input.onchange = (event) => {
            const target = event.target as HTMLElement;
            let rowContainer = target.closest('.builder-property-option-item') as HTMLElement;
            if (rowContainer) {
                const list = Array.from(this.builderPropertyOptionsContainer.children);
                const id: string | undefined = rowContainer?.dataset?.id;

                if (!id) {
                    return;
                }
                const index = list.indexOf(rowContainer);
                const props = this.field.fieldProperties.properties.get(id);

                if (props && Array.isArray(props.value) && index in props.value) {
                    props.value[index] = this.getOption(list[index]);
                }

                EventService.emit('value-changed', this.field);
            }
        };

        return column;
    }

    setOptions() {
        const options: Record<string, string | boolean>[] = [];
        const list = Array.from(this.builderPropertyOptionsContainer.children);
        list.forEach((row, index) => {
            options.push(this.getOption(row));
            
        });

        this.property.value = options;
        EventService.emit('value-changed', this.field);
    }

    getOption(row: Element): Record<string, string | boolean> {
        let value: Record<string, string | boolean> = {};
        this.optionDefinition.forEach(def => {
            const input = row.querySelector('input[name="' + def.value + '"]') as HTMLInputElement;
            value[def.value] = input ? def.type === 'checkbox' ? input.checked : input.value : '';
        });
        return value;
        
    }

    getContent() {
        return this.content;
    }
}