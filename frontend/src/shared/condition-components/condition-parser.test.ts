import { assert, beforeEach, describe, expect, it, vi } from 'vitest';
import { FormService } from '../../form-viewer/services/form-service';
import { InputNucleus } from '../form-components/interface/input-base';
import type { Nucleus } from '../form-components/interface/nucleus';
import { ConditionDto, LogicalOperator, Operator, WordContext } from '../model/types';
import { ConditionParser } from './condition-parser';
import { JsonPathFinder } from './json-path-finder';

vi.mock('../../form-viewer/services/form-service', () => ({
    FormService: {
        addEventListener: vi.fn(),
    },
}));

vi.mock('../generic-components/form-renderer', () => ({
    FormRenderer: {
        isOptionType: vi.fn().mockReturnValue(false),
    },
}));

// Helper to generate dummy input fields
function createMockNucleus(name: string, value: any): Nucleus {
    return {
        name,
        type: 'text',
        getName: () => name,
        getFields: () => null,
        getValue: () => value,
        addValueChangedListener: vi.fn((callback) => callback()),
    } as unknown as Nucleus;
}

describe('ConditionParser', () => {
    let mockForm: any;

    beforeEach(() => {
        vi.clearAllMocks();
        mockForm = {};
    });

    describe('Event binding & initialisatie', () => {
        it('zou moeten registreren bij de FormService tijdens constructie', () => {
            const condition = { var1: 'a', operator: Operator.EQ, var2: 'a' };
            new ConditionParser(condition);

            expect(FormService.addEventListener).toHaveBeenCalledTimes(1);
        });

        it('zou velden moeten binden en listeners moeten toevoegen als het formulier laadt', () => {
            let registeredCallback: ((form: any) => void) | undefined;
            vi.mocked(FormService.addEventListener).mockImplementation((cb) => {
                registeredCallback = cb;
            });
            
            
            const condition = { var1: '${inputField}', operator: Operator.EQ, var2: 'status' };
            const mockField = createMockNucleus('inputField', 'status') as InputNucleus;
            
            const evalSpy = vi.spyOn(JsonPathFinder, 'eval').mockReturnValue([mockField]);
            
            new ConditionParser(condition);

            // Trigger het laden van het formulier
            if (registeredCallback) {
                 registeredCallback(mockForm);
            }

            const wordContext: WordContext = {
                "innerWord": "inputField",
                 "type": "FORM_VALUE",
                 "value": undefined,
                 "word": "${inputField}"
            };

            expect(evalSpy).toHaveBeenCalledWith(wordContext, mockForm);
        });
    });

    describe('Eenvoudige logica evaluatie (.eval)', () => {
        it('zou false moeten returnen bij een lege of ongeldige conditie', () => {
            const parser = new ConditionParser(null as any);
            expect(parser.eval()).toBe(false);
        });

        it('zou EQ (Exact match) correct moeten evalueren', () => {
            const condition = { var1: 'test', operator: Operator.EQ, var2: 'test' };
            const parser = new ConditionParser(condition);
            expect(parser.eval()).toBe(true);

            condition.var2 = 'anders';
            expect(parser.eval()).toBe(false);
        });

        it('zou EQI (Case Insensitive) correct moeten evalueren', () => {
            const condition = { var1: 'TEXT', operator: Operator.EQI, var2: 'text' };
            const parser = new ConditionParser(condition);
            expect(parser.eval()).toBe(true);
        });

        it('zou numerieke vergelijkingen (GT, LT, GTE, LTE) correct moeten uitvoeren', () => {
            const condition = { var1: '10', operator: Operator.GT, var2: '5' };
            const parser = new ConditionParser(condition);
            expect(parser.eval()).toBe(true);

            condition.operator = Operator.LT;
            expect(parser.eval()).toBe(false);
        });

        it('zou moeten crashen als numerieke operators niet-getallen ontvangen', () => {
            const condition = { var1: 'not-a-number', operator: Operator.GT, var2: '5' };
            const parser = new ConditionParser(condition);
            
            expect(() => parser.eval()).toThrow('Values must be numeric for comparison operators.');
        });
    });

    describe('Samengestelde (Composite) logica', () => {
        it('zou een AND operator correct moeten evalueren', () => {
            const compositeCondition = {
                logicalOperator: LogicalOperator.AND,
                conditions: [
                    { var1: 'a', operator: Operator.EQ, var2: 'a' },
                    { var1: 'b', operator: Operator.EQ, var2: 'b' }
                ]
            } as ConditionDto;

            
            
            const parser = new ConditionParser(compositeCondition);
            expect(parser.eval()).toBe(true);


            expect(compositeCondition.conditions).toHaveLength(2);
            // Maak één conditie onwaar
            assert(compositeCondition?.conditions?.[1]);
            compositeCondition.conditions[1].var2 = 'fout';
            expect(parser.eval()).toBe(false);
            

        });

        it('zou een OR operator correct moeten evalueren', () => {
            const compositeCondition = {
                logicalOperator: LogicalOperator.OR,
                conditions: [
                    { var1: 'a', operator: Operator.EQ, var2: 'fout' },
                    { var1: 'b', operator: Operator.EQ, var2: 'b' } // Deze is true
                ]
            } as ConditionDto;

            const parser = new ConditionParser(compositeCondition);
            expect(parser.eval()).toBe(true);
        });
    });

    describe('Callbacks (this.func) en Field Changes', () => {
        it('zou de callback functie moeten aanroepen met het resultaat bij onFieldValueChanged', () => {
            const condition = { var1: 'yes', operator: Operator.EQ, var2: 'yes' };
            const mockCallback = vi.fn();
            
            const parser = new ConditionParser(condition, mockCallback);
            
            parser.onFieldValueChanged();

            expect(mockCallback).toHaveBeenCalledWith(true);
        });
    });
});
