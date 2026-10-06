import { SelectField } from '../../shared/form-components/select-field';
import {
    ConditionDto,
    ConditionType,
    OptionDto
} from '../../shared/model/types';
import { Lang } from '../../shared/services/lang';
import { ConditionTypeCompositeComponent } from './condition-type-composite-component';
import { ConditionTypeSimpleComponent } from './condition-type-simple-component';

export interface ConditionTypeComponent {
    getValue(): ConditionDto;
    setValue(conditionDto: ConditionDto): void;
    getContent(): HTMLElement;
    validate(): boolean;
}

export class ConditionComponent {
    content = document.createElement('div');
    builderConditionContainer = document.createElement('div');

    onDelete: ((value: any) => void) | undefined = undefined;
    onChange: ((value: any) => void) | undefined = undefined;

    conditionType: ConditionType | undefined = undefined;
    conditionTypeComponent?: ConditionTypeComponent;
    conditionTypeSelect: SelectField;

    constructor(
            onChange: ((value: any) => void) | undefined = undefined,
            onDelete: ((value: any) => void) | undefined = undefined) {

        this.onChange = onChange;
        this.onDelete = onDelete;

        this.content.className = 'builder-condition';

        const builderConditionTypeContainer = document.createElement('div');
        builderConditionTypeContainer.className = 'builder-condition-type-container';

        this.conditionTypeSelect = this.createConditionTypeSelect();

        builderConditionTypeContainer.append(
            this.conditionTypeSelect.getContent(),
            this.createRemoveButton());

        this.builderConditionContainer.className = 'builder-condition-container';
        
        this.content.append(
            builderConditionTypeContainer,
            this.builderConditionContainer
        );
    }

    createConditionTypeSelect() {
        const conditionTypeSelect = new SelectField('condition-type')
                .setLabel(Lang.get('condition.type'))
                .setRequired(true)
                .setPlaceholder(Lang.get('condition.type'));

        conditionTypeSelect.addValueChangedListener((name, options: OptionDto[] | undefined) => {
            if (options && options.length !== null) {
                const conditionType = Number(options[0].value) as ConditionType
                this.conditionTypeChanged(conditionType);
                this.valueChanged();
            }
        });

        conditionTypeSelect.addOption('' + ConditionType.SIMPLE, Lang.get('condition.type.simple'));
        conditionTypeSelect.addOption('' + ConditionType.COMPOSITE, Lang.get('condition.type.composite'));
        return conditionTypeSelect;
    }

    createRemoveButton() {
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'builder-properties-button-container';
        const buttonRemove = document.createElement('button');
        buttonRemove.className = 'builder-btn-icon icon icon-x-lg';
        buttonRemove.addEventListener('click', (e: PointerEvent) => {
            if (this.onDelete){
                this.onDelete(this);
            }
        });

        buttonContainer.appendChild(buttonRemove);
        return buttonContainer;
    }

    conditionTypeChanged(conditionType: ConditionType): ConditionTypeComponent {
        this.conditionType = conditionType;
        this.conditionTypeComponent = this.conditionType === ConditionType.COMPOSITE 
                ? new ConditionTypeCompositeComponent(() => { this.valueChanged() })
                : new ConditionTypeSimpleComponent(() => { this.valueChanged() });

        this.builderConditionContainer.innerHTML = '';
        this.builderConditionContainer.append(this.conditionTypeComponent.getContent());

        return this.conditionTypeComponent;
    }

    setValue(conditionDto: ConditionDto | undefined) {
        if (conditionDto?.conditionType !== undefined) {
            this.conditionType = conditionDto.conditionType as ConditionType;
            this.conditionTypeSelect.setValue([{ value: '' + conditionDto.conditionType, text: ''}], true);
            const conditionTypeChanged = this.conditionTypeChanged(conditionDto?.conditionType);
            conditionTypeChanged.setValue(conditionDto);
        }

        return this;
    }

    valueChanged() {
        if (this.onChange) {
            this.onChange(this.getValue());
        }
    }

    getValue(): ConditionDto | undefined {
        return this.conditionTypeComponent?.getValue();

    }

    getContent() {
        return this.content;
    }

    validate(): boolean {
        console.log('ConditionComponent validate', this.conditionType, this.conditionTypeComponent, this.conditionTypeSelect.validate());
        if (!this.conditionTypeComponent) {
            return false;
        }
        
        if (this.conditionType === undefined) {
            return false;
        }

        return this.conditionTypeComponent.validate();
        
    }
}