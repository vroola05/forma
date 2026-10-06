import { FormService } from '../../form-viewer/services/form-service';
import { Form } from '../form-components/form';
import { InputNucleus } from '../form-components/interface/input-base';
import type { Nucleus } from '../form-components/interface/nucleus';
import { FormRenderer } from '../generic-components/form-renderer';
import { Condition, ConditionType, LogicalOperator, Operator } from '../model/types';
import { JsonPathFinder } from './json-path-finder';

export class ConditionParser {
    condition;
    func?: (value: boolean) => void; 

    /**
     * 
     * @param condition 
     * @param func 
     */
    constructor(condition: Condition, func?: (value: boolean) => void) {
        this.condition = condition;
        this.func = func;

        FormService.addEventListener((form) => {
            this.#bindFieldToConditions(this.condition, form);
        });
    }

    /**
     * Returns runs the condition returns true if the 
     * @returns 
     */
    eval(): boolean {
        if (!this.condition || Object.values(this.condition).every(waarde => !waarde)) {
            return false;
        }

        return this.#checkLogic(this.condition);
    }

    onFieldValueChanged() {
        const result = this.eval();
        
        if (this.func) {
            this.func(result);
        }
    }

    #bindFieldToConditions(condition: Condition, form: Form) {
        if (condition === undefined || form === undefined) {
            return;
        }

        if (this.#getConditionType(condition) === ConditionType.COMPOSITE) {
            if (condition.conditions) {
                for (const element of condition.conditions) {
                    this.#bindFieldToConditions(element, form);
                }
            }
        } else {
            this.#bindSimpelConditions(condition, form);
        }
    }
    
    #bindSimpelConditions(condition: Condition, form: Form) {
        if (condition.var1 && this.#isField(condition.var1)) {
            condition.var1Fields = JsonPathFinder.eval(condition.var1, form);
            this.#setFieldListeners(condition.var1Fields);
        }
        if (condition.var2 && this.#isField(condition.var2)) {
            condition.var2Fields = JsonPathFinder.eval(condition.var2, form);
            this.#setFieldListeners(condition.var2Fields);
        }
    }

    #filterInputFields(fields: Nucleus[]): InputNucleus[] {
        return fields.filter((field): field is InputNucleus => 
            field !== null && field !== undefined && 'getValue' in field
        );
    }

    #setFieldListeners(fields: Nucleus[]) {
        const inputFields = this.#filterInputFields(fields);
        
        for (const field of inputFields) {
            field.addValueChangedListener(() => {
                this.onFieldValueChanged();
            });
            
        }
    }

    #checkLogic(condition: Condition): boolean {
        if (this.#getConditionType(condition) === ConditionType.COMPOSITE) {
            
            return this.#evaluateCompositeCondition(condition);
        } else {
            return this.#evaluateCondition(condition);
        }
    }

    #evaluateCompositeCondition(condition: Condition): boolean {
        if( condition.logicalOperator === null) {
            throw new Error("Composite conditions must have a logical operator.");
        }
        if( !condition.conditions || condition.conditions.length === 0) {
            return true;
        }

        switch (condition.logicalOperator) {
            case LogicalOperator.AND:
                return condition.conditions.every(subCondition => this.#checkLogic(subCondition));
            case LogicalOperator.OR:
                return condition.conditions.some(subCondition => this.#checkLogic(subCondition));
            default:
                throw new Error(`Onbekende operator: ${condition.logicalOperator}`);
        }
    }

    #evaluateCondition(condition: Condition) {
        if(!condition.operator) {
            throw new Error('Simple conditions must have an operator.');
        }

        const var1List = condition.var1Fields
                ? this.#getFieldValues(condition.var1Fields)
                : [condition.var1];
        const var2List = condition.var2Fields 
                ? this.#getFieldValues(condition.var2Fields)
                : [condition.var2];

        for (const var1 of var1List) {
            for (const var2 of var2List) {
                if (!this.#evaluateConditionType(var1, condition.operator, var2)) {
                    return false;
                }
            }
        }
        return true;
    }


    #evaluateConditionType(var1: string, operator: Operator, var2: string) {
        const isArray1 = Array.isArray(var1);
        const isArray2 = Array.isArray(var2);

        if (isArray1 && isArray2) {
            if (var1.length !== var2.length) return false;
            return var1.every((val, index) => this.#checkValue(val.value, operator, var2[index].value));
        }

        // 2. var1 is een string, var2 is een lt: Check of var1 in var2 voorkomt
        if (!isArray1 && isArray2) {
            return var2.some(item => this.#checkValue(var1, operator, item.value));
        }

        // 3. var1 is een lt, var2 is een string: Check of var2 in var1 voorkomt
        if (isArray1 && !isArray2) {
            return var1.some(item => this.#checkValue(item.value, operator, var2));
        }

        return this.#checkValue(var1, operator, var2);
    }
        



    /**
     * Return a list of al the values of any of the fields. 
     * Every value is placed in a new record in the array in its own type
     *  - String
     *  - Option[]
     *  - etc
     * @param fields 
     * @returns 
     */
    #getFieldValues(fields: Nucleus[]) {
        const output = [];

        const inputFields = this.#filterInputFields(fields);

        for (const field of inputFields) {
            if (FormRenderer.isOptionType(field.type)) {
                output.push(field.getOptions())
            } else {
                output.push(field.getValue())
            }
        }
        return output;
    }

    #checkValue(var1: string, operator: Operator, var2: string) {
        switch (operator) {
            case Operator.EQI:
                return (!var1 ? var1 : var1.toLowerCase()) === (!var2 ? var2 : var2.toLowerCase());
            case Operator.NEQI:
                return (!var1 ? var1 : var1.toLowerCase()) !== (!var2 ? var2 : var2.toLowerCase());
            case Operator.EQ:
                return var1 === var2;
            case Operator.NEQ:
                return var1 !== var2;
            case Operator.GT:
                return this.#getNumber(var1) > this.#getNumber(var2);
            case Operator.LT:
                return this.#getNumber(var1) < this.#getNumber(var2);
            case Operator.GTE:
                return this.#getNumber(var1) >= this.#getNumber(var2);
            case Operator.LTE:
                return this.#getNumber(var1) <= this.#getNumber(var2);
            default:
                throw new Error("Unsupported operator: " + operator);
        }
    }

    #getNumber(var1: string): number {
        const result = Number(var1);
        if (isNaN(result)) {
            throw new Error('Values must be numeric for comparison operators.');
        }
        return result;
    }
    

    #isField(input: string | undefined) {
        return input?.startsWith("$.");
    }

    #getConditionType(condition: Condition) {
        return !condition.conditions || condition.conditions.length === 0 ? ConditionType.SIMPLE : ConditionType.COMPOSITE;
    }
}
