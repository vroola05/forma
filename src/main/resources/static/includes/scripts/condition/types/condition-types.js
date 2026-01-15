class Condition {
    var1;
    operator;
    var2;
    conditions;
    logicalOperator;

    getConditionType() {
        return !this.conditions ? ConditionType.SIMPLE : ConditionType.COMPOSITE;
    }
}

const LogicalOperator = Object.freeze({
    AND: 'and',
    OR: 'or'
});

const Operator = Object.freeze({
    EQ: 'eq',
    NEQ: 'neq',
    GT: 'gt',
    LT: 'lt',
    GTE: 'gte',
    LTE: 'lte'
});

const ConditionType = Object.freeze({
    SIMPLE: 0,
    COMPOSITE: 1
});

export { Condition, LogicalOperator, Operator, ConditionType };
