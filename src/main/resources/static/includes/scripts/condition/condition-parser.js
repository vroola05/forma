import {  ConditionType, Operator } from './types/condition-types.js';
import { JsonPathTokenizer } from './json-path-tokenizer.js';
import { JsonPathFinder } from './json-path-finder.js';
import { FormService } from '../services/form-service.js';

export class ConditionParser {
    condition;
    func;

    constructor(condition, func) {
        this.condition = condition;
        this.func = func;
        
        FormService.getInstance().addEventListener((form) => {
            this.init(form);
        });
    }

    init(form) {
        if (this.condition && form) {
            if (this.condition.getConditionType() == ConditionType.COMPOSITE) {
            } else {
                if (this.isField(this.condition.var1)) {
                    this.condition.var1Fields = JsonPathFinder.evalTokenized(this.condition.var1, form);
                    this.setFieldListeners(this.condition.var1Fields);
                }
                if (this.isField(this.condition.var2)) {
                    this.condition.var2Fields = JsonPathFinder.evalTokenized(this.condition.var2, form);
                    this.setFieldListeners(this.condition.var2Fields);
                }
            }
        }
    }

    setFieldListeners(fields) {
        for (const field of fields) {
            
            field.addValueChangedListener(() => {
                this.eval();
            });
        }
    }

    eval() {
        if (this.func && this.condition) {
            this.func(this.checkLogic(this.condition));
        }
    }

    isField(input) {
        return input && input.startsWith("$.");
    }

    checkLogic(condition) {
        if (condition.getConditionType() == ConditionType.COMPOSITE) {
            // if( condition.getLogicalOperator() == null) {
            //     throw new IllegalArgumentException("Composite conditions must have a logical operator.");
            // }
            // if( condition.getConditions() == null || condition.getConditions().isEmpty()) {
            //     throw new IllegalArgumentException("Composite conditions must contain at least one sub-condition.");
            // }
            // for(Condition subCondition : condition.getConditions()) {
            //     if (condition.getLogicalOperator() == LogicalOperator.AND) {
            //         if (!checkLogic(form, subCondition)) {
            //             return false;
            //         }
            //     } else if (condition.getLogicalOperator() == LogicalOperator.OR) {
            //         if (checkLogic(form, subCondition)) {
            //             return true;
            //         }
            //     }
            //     throw new IllegalArgumentException("Composite conditions must have a logical operator.");
            // }
            return true;
        } else {
            if(!condition.operator) {
                throw new Error('Simple conditions must have an operator.');
            }
            return this.evaluateCondition(condition);
        }
    }

    evaluateCondition(condition) {
        let var1List = condition.var1Fields ? this.getFieldValues(condition.var1Fields) : [condition.var1];
        let var2List = condition.var2Fields ? this.getFieldValues(condition.var2Fields) : [condition.var2];

        for (const var1 of var1List) {
            for (const var2 of var2List) {
                
                if (!this.checkValue(var1, condition.operator, var2)) {
                    return false;
                }
            }
        }
        return true;
    }

    getFieldValues(fields) {
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

    

    // getBase(name, base, path, index) {
    //     if (!base.getName().equals(name)) {
    //         throw new IllegalArgumentException("Element " + name + " doesn't exist");
    //     }

    // }

    checkValue(var1, operator, var2) {
        switch (operator) {
            case Operator.EQ:
                return var1 == var2;
            case Operator.NEQ:
                return var1 != var2;
            case Operator.GT:
                return this.getNumber(var1) > this.getNumber(var2);
            case Operator.LT:
                return this.getNumber(var1) < this.getNumber(var2);
            case Operator.GTE:
                return this.getNumber(var1) >= this.getNumber(var2);
            case Operator.LTE:
                return this.getNumber(var1) <= this.getNumber(var2);
            default:
                throw new Error("Unsupported operator: " + operator);
        }
    }

    getNumber(var1) {
        if (isNaN(var1)) {
            throw new Error('Values must be numeric for comparison operators.');
        }
        return new Number(var1);
    }
    
}
