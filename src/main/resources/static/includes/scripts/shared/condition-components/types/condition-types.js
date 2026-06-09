class Condition {
    var1;
    operator;
    var2;
    conditions;
    logicalOperator;

    constructor(data = {}) {
        this.var1 = data?.var1;
        this.operator = data?.operator;
        this.var2 = data?.var2;
        this.logicalOperator = data?.logicalOperator;

        this.conditions = [];
        if (data?.conditions) {
            this.conditions = data.conditions.map(con => new Condition(con));
        }
        
    }

    getConditionType() {
        return !this.conditions ? ConditionType.SIMPLE : ConditionType.COMPOSITE;
    }
}

const LogicalOperator = Object.freeze({
    AND: 'and',
    OR: 'or'
});

const Operator = Object.freeze({
    EQI: 'eqi',
    NEQI: 'neqi',
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
