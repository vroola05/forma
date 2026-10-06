import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Nucleus } from '../form-components/interface/nucleus';
import { JsonPathConverter } from './json-path-converter';
import { JsonPathFinder } from './json-path-finder';

vi.mock('./json-path-finder', () => ({
    JsonPathFinder: {
        eval: vi.fn(),
    },
}));

function createMockField(value: string) {
    return {
        getValue: () => value,
    } as any;
}

describe('JsonPathConverter', () => {
    const mockForm = {} as Nucleus;

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Simple behaviour', () => {
        it('Single value without tags or seperators.', () => {
            vi.mocked(JsonPathFinder.eval).mockReturnValue([createMockField('Apple')]);

            const input = 'My laptop is not an {$.fruit}.';
            const result = JsonPathConverter.eval(input, mockForm);

            expect(result).toBe('My laptop is not an Apple.');
            expect(JsonPathFinder.eval).toHaveBeenCalledWith('$.fruit', mockForm);
        });

        it('Multiple values directly behind eache other (empty default separator).', () => {
            vi.mocked(JsonPathFinder.eval).mockReturnValue([
                createMockField('A'),
                createMockField('B'),
                createMockField('C')
            ]);

            const input = 'Alphabeth: {$.letters}';
            const result = JsonPathConverter.eval(input, mockForm);

            expect(result).toBe('Alphabeth: ABC');
        });
    });

    describe('With ConverterOptions tags or seperators.', () => {
        it('Use a seperator between the values.', () => {
            vi.mocked(JsonPathFinder.eval).mockReturnValue([
                createMockField('Red'),
                createMockField('Green'),
                createMockField('Blue')
            ]);

            const input = 'Colors: {$.colors}';
            const result = JsonPathConverter.eval(input, mockForm, { separator: ' - ' });

            expect(result).toBe('Colors: Red - Green - Blue');
        });

        it('Wrap the values in an open and close tag.', () => {
            vi.mocked(JsonPathFinder.eval).mockReturnValue([createMockField('SECRET')]);

            const input = 'The password is {$.password}';
            const result = JsonPathConverter.eval(input, mockForm, {
                openTag: '<b>',
                closeTag: '</b>'
            });

            expect(result).toBe('The password is <b>SECRET</b>');
        });

        it('Use both seperator and tags zou tags (For example in HTML lists).', () => {
            vi.mocked(JsonPathFinder.eval).mockReturnValue([
                createMockField('Laptop'),
                createMockField('Mouse'),
                createMockField('Keyboard')
            ]);

            const input = '<ul>{$.products}</ul>';
            const result = JsonPathConverter.eval(input, mockForm, {
                separator: '\n',
                openTag: '<li>',
                closeTag: '</li>'
            });

            expect(result).toBe('<ul><li>Laptop</li>\n<li>Mouse</li>\n<li>Keyboard</li></ul>');
        });
    });

    describe('Edge cases and empty values.', () => {
        it('Should ignore/filter fields without or with an empty value.', () => {
            vi.mocked(JsonPathFinder.eval).mockReturnValue([
                createMockField('First'),
                { nonValueField: true } as any,
                createMockField(''),
                createMockField('Second')
            ]);

            const input = 'Result: {$.data}.';
            const result = JsonPathConverter.eval(input, mockForm, { separator: ', ' });

            expect(result).toBe('Result: First, Second.');
        });

        it('Should ignore undefined or null values.', () => {
            vi.mocked(JsonPathFinder.eval).mockReturnValue(null as any);

            const input = 'Test {$.unknown} text.';
            const result = JsonPathConverter.eval(input, mockForm);

            expect(result).toBe('Test  text.');
        });
    });

});
