import { describe, expect, it } from 'vitest';
import { JsonPathTokenizer } from './json-path-tokenizer';

describe('JsonPathTokenizer', () => {
    describe('Normal paths', () => {
        it('Correctly tokenize a simple path', () => {
            const result = JsonPathTokenizer.tokenize('$.store.book');
            expect(result).toEqual(['$', 'store', 'book']);
        });

        it('Correctly handle paths with two dots (..) ', () => {
            const result = JsonPathTokenizer.tokenize('$.store..price');
            expect(result).toEqual(['$', 'store', '..', 'price']);
        });

        it('Correctly handle paths with two dots (..) and sub childs', () => {
            const result = JsonPathTokenizer.tokenize('$.store..book.price');
            expect(result).toEqual(['$', 'store', '..', 'book', 'price']);
        });
    });

    describe('Array and Bracket [ ] logic', () => {
        it('Correctly tokenize a wildcard (*) within an array', () => {
            const result = JsonPathTokenizer.tokenize('$.store.book[*]');
            expect(result).toEqual(['$', 'store', 'book', '[*]']);
        });

        it('Correctly tokenize slices (:) in an array', () => {
            const result = JsonPathTokenizer.tokenize('$.store.book[1:5]');
            expect(result).toEqual(['$', 'store', 'book', '[1:5]']);
        });

        it('Correctly tokenize slices (:) in an array with children', () => {
            const result = JsonPathTokenizer.tokenize('$.store.book[1:5].chapter');
            expect(result).toEqual(['$', 'store', 'book', '[1:5]', 'chapter']);
        });
    });

    describe('Syntax and Limit Errors', () => {
        it('Should crash if a fieldname ends with an underscore', () => {
            expect(() => {
                JsonPathTokenizer.tokenize('$.fout-.veld');
            }).toThrow("Het veld fout- mag niet eindigen met een -");
        });

        it('Should crash if a bracket isn\'t closed correctly', () => {
            expect(() => {
                JsonPathTokenizer.tokenize('$.store.book[0');
            }).toThrow("Syntax fout: Niet alle haken zijn gesloten.");
        });
    });
});
