import { SelectField } from '../../../shared/form-components/select-field';
import {
    BuilderCondition,
    ConditionType,
    LogicalOperator,
    Operator,
    OptionDto,
    getLogicalOperatorType,
    getOperatorType
} from '../../../shared/model/types';
import { BuilderConditionsAutocompleteField } from './builder-conditions-autocomplete-field';
import { BuilderPropertiesFooter } from './builder-properties-footer';

export class BuilderPropertiesCondition {
    content = document.createElement('div');
    conditions: BuilderPropertiesCondition[] = [];

    onDelete: ((value: any) => void) | undefined = undefined;
    onChange: ((value: any) => void) | undefined = undefined;

    conditionType: ConditionType | undefined = undefined;
    
    builderCondition: BuilderCondition | undefined;

    conditionTypeSelect: SelectField;

    simpleConditionDom: HTMLElement = document.createElement('div');
    compositeConditionDom = document.createElement('div');
    compositeConditionDropareaDom = document.createElement('div');

    var1SimpleTextfield: BuilderConditionsAutocompleteField = new BuilderConditionsAutocompleteField('var1', 'Variabele 1');
    operatorSimpleSelect: SelectField = new SelectField('opereator', 'Operator', '');
    var2SimpleTextfield: BuilderConditionsAutocompleteField = new BuilderConditionsAutocompleteField('var2', 'Variabele 2');

    
    operatorCompositeSelect: SelectField = new SelectField('opereator', 'Operator', '');
    builderPropertiesFooter: BuilderPropertiesFooter = new BuilderPropertiesFooter('Conditie toevoegen');

    draggedItem: HTMLElement | null = null;

    guid: string;

    constructor(
            builderCondition: BuilderCondition | undefined = undefined,
            onChange: ((value: any) => void) | undefined = undefined,
            onDelete: ((value: any) => void) | undefined = undefined) {

        this.builderCondition = builderCondition;
        this.onChange = onChange;
        this.onDelete = onDelete;

        this.guid = crypto.randomUUID();

        if (builderCondition && builderCondition.conditionType !== undefined) {
            this.conditionType = builderCondition.conditionType as ConditionType;
        }

        this.content.className = 'builder-condition';

        const builderConditionTypeContainer = document.createElement('div');
        builderConditionTypeContainer.className = 'builder-properties-condition-type-container';
        this.content.appendChild(builderConditionTypeContainer);

        this.conditionTypeSelect = new SelectField('condition-type', 'Type', '')
                .setPlaceholder('Condition type');
        this.conditionTypeSelect.addValueChangedListener((name, options: OptionDto[] | undefined) => {
            if (options && options.length !== null) {
                const conditionType = Number(options[0].value) as ConditionType
                this.changeConditionType(conditionType);
            }
        });

        this.conditionTypeSelect.addOption('' + ConditionType.SIMPLE, 'Simpel');
        this.conditionTypeSelect.addOption('' + ConditionType.COMPOSITE, 'Samengesteld');

        builderConditionTypeContainer.appendChild(this.conditionTypeSelect.getContent());

        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'builder-properties-button-container';
        builderConditionTypeContainer.appendChild(buttonContainer);

        const buttonRemove = document.createElement('button');
        buttonRemove.className = 'builder-btn-icon icon icon-x-lg';
        buttonRemove.addEventListener('click', () => {
            if (this.builderCondition) {
                this.builderCondition.destroy();
            }
            if (this.onDelete){
                this.onDelete(undefined);
            }
        });

        buttonContainer.appendChild(buttonRemove);

        this.createSimpleCondition(builderCondition);
        this.createCompositeCondition(builderCondition);
     
        if (builderCondition && builderCondition.conditionType !== undefined) {
            this.conditionTypeSelect.setValue([{ value: '' + builderCondition.conditionType, text: ''}]);
        }
    }

    changeConditionType(conditionType: ConditionType) {
        this.conditionType = conditionType;
        if (this.conditionType === ConditionType.SIMPLE) {
            this.compositeConditionDom.classList.remove('active');
            this.simpleConditionDom.classList.add('active');
        } else if (this.conditionType === ConditionType.COMPOSITE) {
            this.simpleConditionDom.classList.remove('active');
            this.compositeConditionDom.classList.add('active');
        }
    }

    createSimpleCondition(builderCondition: BuilderCondition | undefined) {
        this.simpleConditionDom.className = 'builder-simple-condition';
        this.var1SimpleTextfield
                .setPlaceholder('Variabele 1')
                .setLayout('layout-column')
                .addValueChangedListener((value) => {
                    this.valueChanged();
                });

        this.simpleConditionDom.appendChild(this.var1SimpleTextfield.getContent());
        this.operatorSimpleSelect
                .setPlaceholder('Relationele operator')
                .setLayout('layout-column')
                .addValueChangedListener((value) => {
                    this.valueChanged();
                });
        this.simpleConditionDom.appendChild(this.operatorSimpleSelect.getContent());

        for (const [key, value] of Object.entries(Operator)) {
            this.operatorSimpleSelect.addOption(value, value);
        }

        this.var2SimpleTextfield
                .setPlaceholder('Variabele 2')
                .setLayout('layout-column')
                .addValueChangedListener((value) => {
                    this.valueChanged();
                });
        this.simpleConditionDom.appendChild(this.var2SimpleTextfield.getContent());
        this.content.appendChild(this.simpleConditionDom);

        // initialize object
        if (this.conditionType === ConditionType.SIMPLE && builderCondition) {
            this.var1SimpleTextfield.setValue(builderCondition.var1);
            this.var2SimpleTextfield.setValue(builderCondition.var2);
            this.operatorSimpleSelect.setValue([{ value: '' + builderCondition.operator, text: ''}]);
        }
    }

    createCompositeCondition(builderCondition: BuilderCondition | undefined) {
        this.compositeConditionDom.className = 'builder-composite-condition';
        this.content.appendChild(this.compositeConditionDom);

        this.operatorCompositeSelect
                .setPlaceholder('Relationele operator')
                .addValueChangedListener((value) => {
                    this.valueChanged();
                });

        this.compositeConditionDom.appendChild(this.operatorCompositeSelect.getContent());

        for (const [key, value] of Object.entries(LogicalOperator)) {
            this.operatorCompositeSelect.addOption(value, value);
        }

        this.compositeConditionDropareaDom.className = 'builder-composite-condition-droparea';
        this.compositeConditionDom.appendChild(this.compositeConditionDropareaDom);

        // 
        if (this.conditionType === ConditionType.COMPOSITE && builderCondition) {
            this.operatorCompositeSelect.setValue([{ value: '' + builderCondition.logicalOperator, text: ''}]);
            if (builderCondition.conditions) {
                for (const condition of builderCondition.conditions) {
                    this.addCondition(condition);
                }
            }
        }

        // 
        this.builderPropertiesFooter
                .addButton('add', '', 'builder-properties-btn-add', () => {
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
            if (this.draggedItem === null || (this.draggedItem !== null && this.draggedItem.dataset.guid !== this.guid)) {
                return;
            }
            
            this.compositeConditionDropareaDom.classList.add('drag-over');
        });

        this.compositeConditionDropareaDom.addEventListener('dragleave', (event) => {
            event.stopPropagation();
            event.preventDefault();

            if (this.draggedItem !== null && this.draggedItem.dataset.guid !== this.guid) {
                return;
            }

            this.compositeConditionDropareaDom.classList.remove('drag-over');
        });

        this.compositeConditionDropareaDom.addEventListener("drop", (event) => {
            event.stopPropagation();
            event.preventDefault();
            
            this.compositeConditionDropareaDom.classList.remove('drag-over');
            if (this.draggedItem === null) {
                return;
            }
            
            if (this.draggedItem === null || (this.draggedItem !== null && this.draggedItem.dataset.guid !== this.guid)) {
                return;
            }

            if (!this.draggedItem.classList.contains('builder-property-condition-row')) {
                return;
            }

            if (event.target instanceof Element) {
                let droppedItem = event.target.closest('.builder-property-condition-row');
                if (droppedItem && !this.compositeConditionDropareaDom.contains(droppedItem)) {
                    droppedItem = null;
                }

                this.moveItem(this.draggedItem, droppedItem);
            }
            this.draggedItem = null;
        });
    }
    
    moveItem(draggedItem: Element, droppedItem: Element | null) {
        const list = Array.from(this.compositeConditionDropareaDom.children);
        if (draggedItem === droppedItem) return;

        const draggedIndex = list.findIndex(tabLabel => tabLabel === draggedItem);
        
        
        if (droppedItem === null) {
            this.compositeConditionDropareaDom.appendChild(draggedItem);
        } else {
            const droppedIndex = list.findIndex(tabLabel => tabLabel === droppedItem);
            if (draggedIndex < droppedIndex) {
                this.compositeConditionDropareaDom.insertBefore(draggedItem, droppedItem.nextSibling);
            } else {
                this.compositeConditionDropareaDom.insertBefore(draggedItem, droppedItem);
            }
        }

        const [movedCondition] = this.conditions.splice(draggedIndex, 1);

        if (droppedItem === null) {
            this.conditions.push(movedCondition);
        } else {

            const newList = Array.from(this.compositeConditionDropareaDom.children);
            const newIndex = newList.indexOf(draggedItem);
            this.conditions.splice(newIndex, 0, movedCondition);
        }
    }

    addCondition(builderCondition: BuilderCondition | undefined = undefined) {
        const builderPropertyOptionItem = document.createElement('div');
        builderPropertyOptionItem.className = 'builder-property-condition-row icon icon-grip-vertical';
        builderPropertyOptionItem.setAttribute('data-guid', this.guid);
        builderPropertyOptionItem.setAttribute('draggable', 'true');
        builderPropertyOptionItem.addEventListener("dragstart", (event) => {
            event.stopPropagation();
            this.draggedItem = event.currentTarget as HTMLElement;
        });
        
        this.compositeConditionDropareaDom.appendChild(builderPropertyOptionItem);

        const builderPropertyOptionItemMoveContainer = document.createElement('div');
        builderPropertyOptionItemMoveContainer.className = 'options-type-col';
        builderPropertyOptionItem.appendChild(builderPropertyOptionItemMoveContainer);

        const condition = new BuilderPropertiesCondition(
            builderCondition,
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

    getOperatorType(type: string | undefined): Operator {
        const isValidType = Object.values(Operator).includes(type as any);
        if (isValidType) {
            return type as Operator;
        }
        throw new Error();
    }
    
    getValue(): BuilderCondition {
        const result = {
            conditionType: this.conditionType
        } as BuilderCondition;

        if (this.conditionType === ConditionType.SIMPLE) {
            const operator = this.operatorSimpleSelect.getValue();
            if (operator && operator.length === 1) {
                result.var1 = this.var1SimpleTextfield.getValue();
                result.operator = getOperatorType(operator[0].value);
                result.var2 = this.var2SimpleTextfield.getValue();
            }
        } else if (this.conditionType === ConditionType.COMPOSITE) {

            const logicalOperator = this.operatorCompositeSelect.getValue();
            if (logicalOperator && logicalOperator.length === 1) {
                result.logicalOperator = getLogicalOperatorType(logicalOperator[0].value);
            }

            result.conditions = this.conditions.map(condition => condition.getValue());
        }

        return result;
    }

    getContent() {
        return this.content;
    }
}