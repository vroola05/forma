import { ConditionsAutocompleteField } from "../../shared/form-components/conditions-autocomplete-field";
import { SelectField } from "../../shared/form-components/select-field";
import { ConditionDto, Operator, getOperatorType } from "../../shared/model/types";
import { Lang } from "../../shared/services/lang";
import { ConditionTypeComponent } from "./condition-component";

export class ConditionTypeSimpleComponent implements ConditionTypeComponent {
    onChange: (() => void) | undefined = undefined;
    simpleConditionDom: HTMLElement = document.createElement('div');

    var1SimpleTextfield: ConditionsAutocompleteField = new ConditionsAutocompleteField('var1').setLabel(Lang.get('condition.simple.var1'));
    operatorSimpleSelect: SelectField = new SelectField('opereator').setLabel(Lang.get('condition.simple.operator'));
    var2SimpleTextfield: ConditionsAutocompleteField = new ConditionsAutocompleteField('var2').setLabel(Lang.get('condition.simple.var2'));

    constructor(onChange: (() => void) | undefined = undefined) {
        this.onChange = onChange;
        this.simpleConditionDom.className = 'builder-simple-condition';
        this.var1SimpleTextfield
                .setRequired(true)
                .setPlaceholder(Lang.get('condition.simple.var1'))
                .setLayout('layout-column')
                .addValueChangedListener(() => {
                    this.valueChanged();
                });

        this.simpleConditionDom.appendChild(this.var1SimpleTextfield.getContent());
        this.operatorSimpleSelect
                .setRequired(true)
                .setPlaceholder(Lang.get('condition.simple.operator'))
                .setLayout('layout-column')
                .addValueChangedListener(() => {
                    this.valueChanged();
                });

        this.simpleConditionDom.appendChild(this.operatorSimpleSelect.getContent());

        for (const [key, value] of Object.entries(Operator)) {
            this.operatorSimpleSelect.addOption(value, value);
        }

        this.var2SimpleTextfield
                .setRequired(true)
                .setPlaceholder(Lang.get('condition.simple.var2'))
                .setLayout('layout-column')
                .addValueChangedListener(() => {
                    this.valueChanged();
                });
        
        this.simpleConditionDom.appendChild(this.var2SimpleTextfield.getContent());
    }

    setValue(conditionDto: ConditionDto): void {
        if (conditionDto === undefined) {
            return;
        }
        this.var1SimpleTextfield.setValue(conditionDto.var1);
        this.var2SimpleTextfield.setValue(conditionDto.var2);

        if (conditionDto.operator) {
            this.operatorSimpleSelect.setValue([{ value: '' + conditionDto.operator, text: ''}]);
        }
    }

    valueChanged() {
        if (this.onChange) {
            this.onChange();
        }
    }

    getValue(): ConditionDto {
        const operator = this.operatorSimpleSelect.getValue();
        return {
            var1: this.var1SimpleTextfield.getValue(),
            operator: operator?.[0] ? getOperatorType(operator[0].value) : undefined,
            var2: this.var2SimpleTextfield.getValue()
        };
    }

    validate(): boolean {
        let isValid = true;

        if (!this.var1SimpleTextfield.validate()) {
            isValid = false;
        }

        if (!this.operatorSimpleSelect.validate()) {
            isValid = false;
        }

        if (!this.var2SimpleTextfield.validate()) {
            isValid = false;
        }

        return isValid;
    }

    getContent(): HTMLElement {
        return this.simpleConditionDom;
    }
}