import { SelectField } from "../../shared/form-components/select-field";
import { ConditionDto, ConditionType, getLogicalOperatorType, LogicalOperator } from "../../shared/model/types";
import { Lang } from "../../shared/services/lang";
import { ConditionComponent, ConditionTypeComponent } from "./condition-component";
import { FooterAddComponent } from "./footer-add-component";

export class ConditionTypeCompositeComponent implements ConditionTypeComponent {
    compositeConditionDom = document.createElement('div');
    compositeConditionDropareaDom = document.createElement('div');

    operatorCompositeSelect: SelectField = new SelectField('opereator').setLabel('Operator');
    footerAddComponent: FooterAddComponent = new FooterAddComponent('Conditie toevoegen');

    draggedItem: HTMLElement | null = null;

    conditions: ConditionComponent[] = [];

    guid: string;
    onChange: (() => void) | undefined = undefined;

    constructor(onChange: (() => void) | undefined = undefined) {
        this.onChange = onChange;
        // The guid is used for drag-and-drop. It is not possible to move a condition to an other dropzone 
        this.guid = crypto.randomUUID();
    
        this.compositeConditionDom.className = 'builder-composite-condition';

        this.operatorCompositeSelect
                .setRequired(true)
                .setPlaceholder(Lang.get('condition.composite.operator'))
                .addValueChangedListener(() => {
                    this.valueChanged();
                });

        this.compositeConditionDom.appendChild(this.operatorCompositeSelect.getContent());

        for (const [key, value] of Object.entries(LogicalOperator)) {
            this.operatorCompositeSelect.addOption(value, value);
        }

        this.compositeConditionDropareaDom.className = 'builder-composite-condition-droparea';
        this.compositeConditionDom.appendChild(this.compositeConditionDropareaDom);

        this.footerAddComponent.addButton('add', '', 'builder-properties-btn-add', () => {
            this.addCondition();
            this.valueChanged();
        });
        this.compositeConditionDom.appendChild(this.footerAddComponent.getContent());
    
        this.bindDragAndDrop();
    }
    
    addCondition() {
        const builderPropertyOptionItem = document.createElement('div');
        builderPropertyOptionItem.className = 'builder-property-condition-row icon icon-grip-vertical';
        builderPropertyOptionItem.dataset.guid = this.guid;

        builderPropertyOptionItem.setAttribute('draggable', 'true');
        builderPropertyOptionItem.addEventListener("dragstart", (event) => {
            event.stopPropagation();
            this.draggedItem = event.currentTarget as HTMLElement;
        });

        const builderPropertyOptionItemMoveContainer = document.createElement('div');
        builderPropertyOptionItemMoveContainer.className = 'options-type-col';
        builderPropertyOptionItem.appendChild(builderPropertyOptionItemMoveContainer);

        const conditionComponent = this.createConditionComponent();
        this.conditions.push(conditionComponent);
        builderPropertyOptionItemMoveContainer.appendChild(conditionComponent.getContent());

        this.compositeConditionDropareaDom.appendChild(builderPropertyOptionItem);
        return conditionComponent;
    }

    createConditionComponent() {
        const conditionComponent = new ConditionComponent(
            () => {
                // Call the parent onChanged
                // Recursivly update all conditions
                this.valueChanged();
            }, (conditionComponentChild: ConditionComponent) => {
                const index = this.conditions?.indexOf(conditionComponentChild);
                if (index !== undefined && index >= 0) {
                    this.conditions.splice(index, 1);
                    const child = this.compositeConditionDropareaDom.children[index];
                    child.remove();
                }
                this.valueChanged();
            });
        
        return conditionComponent;
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

        const draggedIndex = list.indexOf(draggedItem);
        
        
        if (droppedItem === null) {
            this.compositeConditionDropareaDom.appendChild(draggedItem);
        } else {
            const droppedIndex = list.indexOf(droppedItem);
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

    valueChanged() {
        if (this.onChange) {
            this.onChange();
        }
    }

    setValue(conditionDto: ConditionDto) {
        if (conditionDto === undefined) {
            return;
        }
        this.operatorCompositeSelect.setValue([{ value: '' + conditionDto.logicalOperator, text: ''}]);

        if (conditionDto.conditions) {
            for (const conditionDtoChild of conditionDto.conditions) {
                const conditionComponent = this.addCondition();
                conditionComponent.setValue(conditionDtoChild);
            }
        }
    }

    getValue(): ConditionDto {
        const logicalOperator = this.operatorCompositeSelect.getValue();
        return {
            conditionType: ConditionType.COMPOSITE,
            logicalOperator: logicalOperator?.[0] ? getLogicalOperatorType(logicalOperator[0].value) : undefined,
            conditions: this.conditions.flatMap(condition => {
                const value = condition.getValue();
                return value !== undefined ? [value] : [];
            })
        };
    }

    validate(): boolean {
        let valid = true;

        if (!this.operatorCompositeSelect.validate()) {
            valid = false;
        }

        if (this.conditions.length === 0) {
            if (valid) {
                this.operatorCompositeSelect.setValidationState(false);
                this.operatorCompositeSelect.setBackendErrorsField(false, Lang.get('condition.validation.required'));
            }
            valid = false;
        }
        for (const condition of this.conditions) {
            if (!condition.validate()) {
                valid = false;
            }
        }

        return valid;
    }

    getContent(): HTMLElement {
        return this.compositeConditionDom;
    }
}