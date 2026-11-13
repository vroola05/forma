import { FormService } from '../../form-viewer/services/form-service';
import { Form } from '../form-components/form';
import { InputNucleus } from '../form-components/interface/input-base';
import type { Nucleus } from '../form-components/interface/nucleus';
import { FormRenderer } from '../generic-components/form-renderer';
import { ConditionDto, ConditionType, LogicalOperator, Operator, WordContext } from '../model/types';
import { JsonPathFinder } from './json-path-finder';

export class ConditionParser {
    condition;
    func?: (value: boolean) => void;

    /**
     * 
     * @param condition 
     * @param func 
     */
    constructor(condition: ConditionDto, func?: (value: boolean) => void) {
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

    #bindFieldToConditions(condition: ConditionDto, form: Form) {
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

    #bindSimpelConditions(condition: ConditionDto, form: Form) {
        if (condition.var1) {
            const conditionalValues = JsonPathFinder.extractVariablesFromInput(condition.var1);
            if (conditionalValues) {
                condition.var1Fields = new Map();
                for (const value of conditionalValues) {
                    JsonPathFinder.eval(value, form);
                    condition.var1Fields.set(value.word, value);

                    this.#setFieldListener(value.fields)
                }
            }

        }
        if (condition.var2) {
            const conditionalValues = JsonPathFinder.extractVariablesFromInput(condition.var2);
            if (conditionalValues) {
                condition.var2Fields = new Map();
                for (const value of conditionalValues) {
                    JsonPathFinder.eval(value, form);
                    condition.var2Fields.set(value.word, value);

                    this.#setFieldListener(value.fields)
                }
            }
        }
    }




    #filterInputFields(fields: Nucleus[]): InputNucleus[] {
        return fields.filter((field): field is InputNucleus =>
            field !== null && field !== undefined && 'getValue' in field
        );
    }


    #setFieldListener(fields?: Nucleus[]) {
        if (!fields) {
            return
        }

        const inputFields = this.#filterInputFields(fields);
        for (const field of inputFields) {
            field.addValueChangedListener(() => {
                this.onFieldValueChanged();
            });
        }
    }

    #checkLogic(condition: ConditionDto): boolean {
        if (this.#getConditionType(condition) === ConditionType.COMPOSITE) {

            return this.#evaluateCompositeCondition(condition);
        } else {
            return this.#evaluateCondition(condition);
        }
    }

    #evaluateCompositeCondition(condition: ConditionDto): boolean {
        if (condition.logicalOperator === null) {
            throw new Error("Composite conditions must have a logical operator.");
        }
        if (!condition.conditions || condition.conditions.length === 0) {
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

    #evaluateCondition(condition: ConditionDto) {
        if (!condition.operator) {
            throw new Error('Simple conditions must have an operator.');
        }

        const var1List = this.getParsedValues(condition.var1, condition.var1Fields);
        const var2List = this.getParsedValues(condition.var2, condition.var2Fields);

        for (const var1 of var1List) {
            for (const var2 of var2List) {
                if (!this.#evaluateConditionType(var1, condition.operator, var2)) {
                    return false;
                }
            }
        }
        return true;
    }

    /**
     * Returns a list of parsed values 
     * 
     * Example: If ${form.field} = "test" and #{varName} = "variable".
     * And the first parameter (base) is "${form.field} and #{varName}"
     * the function returns ["test and variable"]
     * 
     * Because the use of json path, it is posible that one parameter returns multiple Nucleus
     * for example: the field ${store[*].book} returns a list of all books
     * 
     * Within the second parameter:
     *  1) index contains the different variables
     *  2) the group of values
     * 
     * TODO - this function is much to slow and has weird multipliers. rebuild this code!
     * 
     * @param base 
     * @param fieldGroups 
     * @returns 
     */
    getParsedValues(base: string, fieldMap?: Map<string, WordContext>): string[] {
        if (!base) return [];
        if (!fieldMap || fieldMap.size === 0) return [base];

        const regex = /[#$]\{([A-Za-z0-9._-]+)\}/g;

        // Find all placeholeders in base
        const matches = [...base.matchAll(regex)];
        if (matches.length === 0) return [base];

        // extract all values from the Nucleus[]
        const valueGroupsForThisText: string[][] = [];

        for (const match of matches) {
            const fullWord = match[0];
            const context = fieldMap.get(fullWord);

            let extractedValues: string[] = [""];
            if (context?.fields === undefined) {
                return [];
            }

            context.value = this.#getFieldValues(context?.fields);

            if (context && context.value !== undefined && context.value !== null) {
                if (Array.isArray(context.value)) {
                    extractedValues = context.value.map(v => String(v));
                } else {
                    extractedValues = [String(context.value)];
                }
            }

            valueGroupsForThisText.push(extractedValues);
        }

        // Create an array with all posible cominations
        let combinations: string[][] = [[]];
        for (const group of valueGroupsForThisText) {
            const nextCombinations: string[][] = [];
            for (const current of combinations) {
                for (const value of group) {
                    nextCombinations.push([...current, value]);
                }
            }
            combinations = nextCombinations;
        }

        // Replace the placeholders in base for each unique comination
        const results: string[] = [];
        for (const valueArray of combinations) {
            let index = 0;
            const parsedString = base.replace(regex, () => {
                return valueArray[index++];
            });
            results.push(parsedString);
        }

        return results;
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
    #getFieldValues(fields: Nucleus[]): any[] {
        const output = [];

        const inputFields = this.#filterInputFields(fields);

        for (const field of inputFields) {
            output.push(this.#getFieldValue(field));
        }
        return output;
    }

    #getFieldValue(field: InputNucleus) {
        if (FormRenderer.isOptionType(field.type)) {
            return field.getOptions().map(option => option.value);
        } else {
            return field.getValue();
        }
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


    #getConditionType(condition: ConditionDto) {
        return !condition.conditions || condition.conditions.length === 0 ? ConditionType.SIMPLE : ConditionType.COMPOSITE;
    }
}
