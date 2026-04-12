import { SelectField } from '../../../shared/form-components/select-field.js';
import { BuilderConditionsAutocompleteField } from './builder-conditions-autocomplete-field.js';
import { Operator, ConditionType, LogicalOperator } from '../../../shared/condition-components/types/condition-types.js';
import { BuilderPropertiesFooter } from './builder-properties-footer.js';

export class BuilderPropertiesCondition {
    content = document.createElement('div');
    conditions = [];
    onDelete = undefined;
    onChange = undefined;
    conditionType = undefined;
    
    constructor(conditionData = undefined, onChange = undefined, onDelete = undefined) {
        this.guid = crypto.randomUUID();

        if (conditionData && conditionData.conditionType) {
            this.conditionType = ConditionType.SIMPLE === ConditionType[conditionData.conditionType] ? ConditionType.SIMPLE : ConditionType.COMPOSITE;
        }

        console.log(conditionData, this.conditionType);
        this.createContent(conditionData);
        this.onChange = onChange;
        this.onDelete = onDelete;
    }

    createContent(conditionData) {
        this.content.className = 'builder-condition';

        const builderConditionTypeContainer = document.createElement('div');
        builderConditionTypeContainer.className = 'builder-properties-condition-type-container';
        this.content.appendChild(builderConditionTypeContainer);

        this.conditionTypeSelect = new SelectField('condition-type', 'Type')
                .setPlaceholder('Condition type');
        this.conditionTypeSelect.addValueChangedListener((name, option) => {
            this.changeConditionType(option[0].value);
        });
        this.conditionTypeSelect.addOption(ConditionType.SIMPLE, 'Simpel');
        this.conditionTypeSelect.addOption(ConditionType.COMPOSITE, 'Samengesteld');

        builderConditionTypeContainer.appendChild(this.conditionTypeSelect.getContent());

        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'builder-properties-button-container';
        builderConditionTypeContainer.appendChild(buttonContainer);

        const buttonRemove = document.createElement('button');
        buttonRemove.className = 'builder-btn-icon icon icon-x-lg';
        buttonRemove.addEventListener('click', () => {
            
            this.onDelete();
        });
        buttonContainer.appendChild(buttonRemove);

        this.createSimpleCondition(conditionData);
        this.createCompositeCondition(conditionData);
        
        if (conditionData && conditionData.conditionType) {
            this.conditionTypeSelect.setValue(String(ConditionType[conditionData.conditionType]));
        }
       
    }

    changeConditionType(conditionType) {
        this.conditionType = Number(conditionType);
        if (this.conditionType === ConditionType.SIMPLE) {
            this.compositeConditionDom.classList.remove('active');
            this.simpleConditionDom.classList.add('active');
        } else if (this.conditionType === ConditionType.COMPOSITE) {
            this.simpleConditionDom.classList.remove('active');
            this.compositeConditionDom.classList.add('active');
        }
    }

    createSimpleCondition(conditionData) {
        this.simpleConditionDom = document.createElement('div');
        this.simpleConditionDom.className = 'builder-simple-condition';
        this.var1SimpleTextfield = new BuilderConditionsAutocompleteField('var1', 'Variabele 1')
                .setPlaceholder('Variabele 1')
                .setLayout('layout-column')
                .addValueChangedListener((value) => {
                    this.valueChanged();
                });

        this.simpleConditionDom.appendChild(this.var1SimpleTextfield.getContent());
        this.operatorSimpleSelect = new SelectField('opereator', 'Operator')
                .setPlaceholder('Relationele operator')
                .setLayout('layout-column')
                .addValueChangedListener((value) => {
                    this.valueChanged();
                });
        this.simpleConditionDom.appendChild(this.operatorSimpleSelect.getContent());

        for (const [key, value] of Object.entries(Operator)) {
            this.operatorSimpleSelect.addOption(value, value);
        }

        this.var2SimpleTextfield= new BuilderConditionsAutocompleteField('var2', 'Variabele 2')
                .setPlaceholder('Variabele 2')
                .setLayout('layout-column')
                .addValueChangedListener((value) => {
                    this.valueChanged();
                });
        this.simpleConditionDom.appendChild(this.var2SimpleTextfield.getContent());
        this.content.appendChild(this.simpleConditionDom);

        // initialize object
        if (this.conditionType === ConditionType.SIMPLE && conditionData) {
            this.var1SimpleTextfield.setValue(conditionData.var1);
            this.var2SimpleTextfield.setValue(conditionData.var2);
            this.operatorSimpleSelect.setValue(''+conditionData.operator);
        }
    }

    createCompositeCondition(conditionData) {
        this.compositeConditionDom = document.createElement('div');
        this.compositeConditionDom.className = 'builder-composite-condition';
        this.content.appendChild(this.compositeConditionDom);

        this.operatorCompositeSelect = new SelectField('opereator', 'Operator')
                .setPlaceholder('Relationele operator')
                .addValueChangedListener((value) => {
                    this.valueChanged();
                });
        this.compositeConditionDom.appendChild(this.operatorCompositeSelect.getContent());

        for (const [key, value] of Object.entries(LogicalOperator)) {
            this.operatorCompositeSelect.addOption(value, value);
        }

        this.compositeConditionDropareaDom = document.createElement('div');
        this.compositeConditionDropareaDom.className = 'builder-composite-condition-droparea';
        this.compositeConditionDom.appendChild(this.compositeConditionDropareaDom);

        // 
        if (this.conditionType === ConditionType.COMPOSITE && conditionData) {
            this.operatorCompositeSelect.setValue(conditionData.logicalOperator);
            if (conditionData.conditions) {
                for (const condition of conditionData.conditions) {
                    this.addCondition(condition);
                }
            }
        }

        // 
        this.builderPropertiesFooter = new BuilderPropertiesFooter('Conditie toevoegen')
                .addButton('add', '', 'builder-properties-btn-add', (event) => {
                    this.addCondition();
                    this.valueChanged();
                });
        this.compositeConditionDom.appendChild(this.builderPropertiesFooter.getContent());
    
        this.bindDragAndDrop();
        
    }

    bindDragAndDrop() {
        this.compositeConditionDropareaDom.addEventListener("dragover", (event) => {
            event.stopPropagation();
            event.preventDefault();
            if (this.draggedItem == null || (this.draggedItem != null && this.draggedItem.dataset.guid !== this.guid)) {
                return;
            }
            
            this.compositeConditionDropareaDom.classList.add('drag-over');
        });

        this.compositeConditionDropareaDom.addEventListener('dragleave', (event) => {
            event.stopPropagation();
            event.preventDefault();

            if (this.draggedItem != null && this.draggedItem.dataset.guid !== this.guid) {
                return;
            }

            this.compositeConditionDropareaDom.classList.remove('drag-over');
        });

        this.compositeConditionDropareaDom.addEventListener("drop", (event) => {
            event.stopPropagation();
            event.preventDefault();
            
            this.compositeConditionDropareaDom.classList.remove('drag-over');
            if (this.draggedItem == null) {
                return;
            }
            
            if (this.draggedItem == null || (this.draggedItem != null && this.draggedItem.dataset.guid !== this.guid)) {
                return;
            }

            if (!this.draggedItem.classList.contains('builder-property-condition-row')) {
                return;
            }

            let droppedItem = event.target.closest('.builder-property-condition-row');
            if (droppedItem && !this.compositeConditionDropareaDom.contains(droppedItem)) {
                droppedItem = null;
            }

            this.moveItem(this.draggedItem, droppedItem);

            this.draggedItem = null;
        });
    }
    
    moveItem(draggedItem, droppedItem) {
        const list = Array.from(this.compositeConditionDropareaDom.children);
        if (draggedItem === droppedItem) return;

        let draggedIndex = list.findIndex(tabLabel => tabLabel === draggedItem);
        let droppedIndex = null;
        
        if (droppedItem == null) {
            this.compositeConditionDropareaDom.appendChild(draggedItem);
        } else {
            droppedIndex = list.findIndex(tabLabel => tabLabel === droppedItem);
            if (draggedIndex < droppedIndex) {
                this.compositeConditionDropareaDom.insertBefore(draggedItem, droppedItem.nextSibling);
            } else {
                this.compositeConditionDropareaDom.insertBefore(draggedItem, droppedItem);
            }
        }

        const [movedCondition] = this.conditions.splice(draggedIndex, 1);

        if (droppedItem == null) {
            this.conditions.push(movedCondition);
        } else {

            const newList = Array.from(this.compositeConditionDropareaDom.children);
            const newIndex = newList.indexOf(draggedItem);
            this.conditions.splice(newIndex, 0, movedCondition);
        }
    }

    addCondition(conditionData = {}) {
        const builderPropertyOptionItem = document.createElement('div');
        builderPropertyOptionItem.className = 'builder-property-condition-row icon icon-grip-vertical';
        builderPropertyOptionItem.setAttribute('data-guid', this.guid);
        builderPropertyOptionItem.setAttribute('draggable', 'true');
        builderPropertyOptionItem.addEventListener("dragstart", (event) => {
            event.stopPropagation();
            this.draggedItem = event.currentTarget;
        });
        
        this.compositeConditionDropareaDom.appendChild(builderPropertyOptionItem);

        const builderPropertyOptionItemMoveContainer = document.createElement('div');
        builderPropertyOptionItemMoveContainer.className = 'options-type-col';
        builderPropertyOptionItem.appendChild(builderPropertyOptionItemMoveContainer);

        const condition = new BuilderPropertiesCondition(
            conditionData,
            (onChangedValue) => {
                this.valueChanged();
            }, (builderPropertiesCondition) => {
            const index = this.conditions.indexOf(builderPropertiesCondition);
            if (index >= 0) {
                this.conditions.splice(index, 1);

                const child = this.compositeConditionDropareaDom.children[index];
                this.compositeConditionDropareaDom.removeChild(child);
            }
        });

        builderPropertyOptionItemMoveContainer.appendChild(condition.getContent());

        this.conditions.push(condition);
    }

    valueChanged() {
        if (this.onChange) {
            this.onChange(this.getValue());
        }
    }

    getValue() {
        const result = {
            conditionType: Object.keys(ConditionType)
                .find(key => ConditionType[key] === this.conditionType)
        }
        if (this.conditionType === ConditionType.SIMPLE) {
            result.var1 = this.var1SimpleTextfield.getValue();
            result.operator = this.operatorSimpleSelect.getValue();
            result.var2 = this.var2SimpleTextfield.getValue();
        } else if (this.conditionType === ConditionType.COMPOSITE) {
            result.logicalOperator = this.operatorCompositeSelect.getValue();
            result.conditions = this.conditions.map(condition => condition.getValue());
        }
        return result;
    }

    getContent() {
        return this.content;
    }
}