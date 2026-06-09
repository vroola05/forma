import {  ConditionType, Operator, LogicalOperator } from './types/condition-types.js';
import { JsonPathFinder } from './json-path-finder.js';
import { FormService } from '../../form-viewer/services/form-service.js';

export class ConditionParser {
    condition;
    func;

    constructor(condition, func) {
        this.condition = condition;
        this.func = func;
        
        FormService.getInstance().addEventListener((form) => {
            this.#bindFieldToConditions(this.condition, form);
        });
    }


    /**
     * This function is also called from outside
     */
    eval() {
        if (this.func && this.condition && !Object.values(this.condition).every(waarde => !waarde)) {
            
            this.func(this.checkLogic(this.condition));
        }
    }

    isField(input) {
        return input && input.startsWith("$.");
    }

    getConditionType(condition) {
        return !condition.conditions || condition.conditions.length == 0 ? ConditionType.SIMPLE : ConditionType.COMPOSITE;
    }

    #bindFieldToConditions(condition, form) {
        if (condition && form) {
            if (this.getConditionType(condition) == ConditionType.COMPOSITE) {
                for (const i in condition.conditions) {
                    this.#bindFieldToConditions(condition.conditions[i], form);
                }
            } else {
                this.#bindSimpelConditions(condition, form);
            }
        }
    }
    
    #bindSimpelConditions(condition, form) {
        if (this.isField(condition.var1)) {
            condition.var1Fields = JsonPathFinder.evalTokenized(condition.var1, form);
            this.#setFieldListeners(condition.var1Fields);
        }
        if (this.isField(condition.var2)) {
            condition.var2Fields = JsonPathFinder.evalTokenized(condition.var2, form);
            this.#setFieldListeners(condition.var2Fields);
        }
    }

    #setFieldListeners(fields) {
        for (const field of fields) {
            field.addValueChangedListener(() => {
                this.eval();
            });
        }
    }

    checkLogic(condition) {
        if (this.getConditionType(condition) == ConditionType.COMPOSITE) {
            
            if( condition.logicalOperator == null) {
                throw new Error("Composite conditions must have a logical operator.");
            }
            if( !condition.conditions || condition.conditions.length === 0) {
                return true;
            }

            if (condition.logicalOperator == LogicalOperator.AND) {
                for(const subCondition of condition.conditions) {
                    if (!this.checkLogic(subCondition)) {
                        return false;
                    }
                }
                return true;
            }
            if (condition.logicalOperator == LogicalOperator.OR) {
                for(const subCondition of condition.conditions) {
                    if (this.checkLogic(subCondition)) {
                        return true;
                    }
                }
                return false;
            }
            
        } else {
            
            if(!condition.operator) {
                throw new Error('Simple conditions must have an operator.');
            }
            
            return this.#evaluateCondition(condition);
        }
    }

    #evaluateCondition(condition) {
        let var1List = condition.var1Fields ? this.#getFieldValues(condition.var1Fields) : [condition.var1];
        let var2List = condition.var2Fields ? this.#getFieldValues(condition.var2Fields) : [condition.var2];
        for (const var1 of var1List) {
            for (const var2 of var2List) {
                if (!this.#evaluateConditionType(var1, condition.operator, var2)) {
                    return false;
                }
            }
            return true;
        }
    }


    #evaluateConditionType(var1, operator, var2) {
        const isArray1 = Array.isArray(var1);
        const isArray2 = Array.isArray(var2);

        if (isArray1 && isArray2) {
            if (var1.length !== var2.length) return false;
            return var1.every((val, index) => this.#checkValue(val.value, operator, var2[index].value));
        }

        // 2. var1 is een string, var2 is een lijst: Check of var1 in var2 voorkomt
        if (!isArray1 && isArray2) {
            return var2.some(item => this.#checkValue(var1, operator, item.value));
        }

        // 3. var1 is een lijst, var2 is een string: Check of var2 in var1 voorkomt
        if (isArray1 && !isArray2) {
            return var1.some(item => this.#checkValue(item.value, operator, var2));
        }

        return this.#checkValue(var1, operator, var2);
    }
        



    #getFieldValues(fields) {
        const output = [];

        for (const field of fields) {
            if (field.hasOptions()) {
                output.push(field.getOptions())
            } else {
                output.push(field.getValue())
            }
        }
        return output;
    }

    #checkValue(var1, operator, var2) {
        switch (operator) {
            case Operator.EQI:
                return (!var1 ? var1 : var1.toLowerCase()) == (!var2 ? var2 : var2.toLowerCase());
            case Operator.NEQI:
                return (!var1 ? var1 : var1.toLowerCase()) != (!var2 ? var2 : var2.toLowerCase());
            case Operator.EQ:
                return var1 == var2;
            case Operator.NEQ:
                return var1 != var2;
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

    #getNumber(var1) {
        if (isNaN(var1)) {
            throw new Error('Values must be numeric for comparison operators.');
        }
        return new Number(var1);
    }
    
}
