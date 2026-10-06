
import { ConditionComponent } from "../../form-builder/component/condition-component";
import { FooterAddComponent } from "../../form-builder/component/footer-add-component";
import { ConditionDto, TranslationDto } from "../model/types";
import { Lang } from "../services/lang";
import { InputNucleus } from "./interface/input-base";

export class ConditionsField extends InputNucleus<HTMLDivElement> {
    conditionComponent?: ConditionComponent;

    conditionsContainerDom: HTMLElement = document.createElement('div');
    footerAddComponent: FooterAddComponent;

    constructor(name: string, labels: TranslationDto[] | undefined, id: string | undefined = undefined) {
        super(document.createElement('div'), name, labels, id);
        this.type = 'conditions';

        this.inputElement.id = this.getId();

        this.conditionsContainerDom.className = 'field-conditions-container';

        this.footerAddComponent = new FooterAddComponent(Lang.get('condition.add'))
            .addButton('add', '', 'builder-properties-btn-add', () => {
                if (!this.conditionComponent) {
                    this.addCondition();
                    this.valueChanged();
                }
            });

            this.inputElement.append(
                this.conditionsContainerDom,
                this.footerAddComponent.getContent());
        
        this.createInput(this.inputElement);
    }

    setType(type: string) {
        this.type = type;
        return this;
    }

    addCondition(conditionDto: ConditionDto | undefined = undefined) {
        this.conditionComponent = new ConditionComponent(
            (value: any) => {
                this.updateValue(value);
            },
            () => {
                this.conditionsContainerDom.innerHTML = '';
                this.conditionComponent = undefined;
                this.footerAddComponent.show(true);
                this.valueChanged();
            });
        this.footerAddComponent.show(false);
        this.conditionComponent.setValue(conditionDto);
        this.conditionsContainerDom.appendChild(this.conditionComponent.getContent());
    }

    validate() {
        let isValid = true;
        if (!this.getShow()) {
            return isValid;
        }
        if (this.required && !this.conditionComponent) {
            isValid = false;
            this.errors.push(Lang.get('condition.validation.required'));

            this.setValidationState(isValid);
            return isValid;
        }

        return this.conditionComponent?.validate() ?? isValid;
    }

    setValue(value: ConditionDto | undefined, noCallback: boolean = false) {
        this.conditionComponent?.setValue(value);
        this.updateValue(value, noCallback);

        return this;
    }

    updateValue(value: any | undefined, noCallback: boolean = false) {
        this.value = value ?? undefined;
        this.valueChanged(noCallback);
    }

    getValue() {
        return this.conditionComponent?.getValue();
    }

    clone() {
        const conditionsField = new ConditionsField(this.name, this.labels);
        conditionsField.setType(this.type);
        conditionsField.setValue(this.value);
        conditionsField.setClasses(this.classes);

        return conditionsField;
    }
}