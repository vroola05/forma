import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Nucleus } from '../form-components/interface/nucleus';
import { JsonPathConverter } from './json-path-converter';

function createMockNucleus(name: string, value: string | null, children: any[] = []): Nucleus {
    return {
        name: name,
        type: 'text',
        getName: () => name,
        getFields: () => children.length > 0 ? children : null,
        getValue: () => value,
    } as unknown as Nucleus;
}

describe('JsonPathConverter', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('JsonPathConverter - Integrationtests.', () => {

        describe('Nested Nucleus structures.', () => {
            it('Should get a value from a nested structure.', () => {
                const titleNode = createMockNucleus('title', 'Holy Bible');
                const bookNode = createMockNucleus('book', null, [titleNode]);
                const formTree = createMockNucleus('store', null, [bookNode]);

                const input = "I am reading the book {$.store.book.title}.";
                const result = JsonPathConverter.eval(input, formTree);

                expect(result).toBe("I am reading the book Holy Bible.");
            });

            it('Uses a wildcards [*] to receive al values from the children.', () => {
                const book1 = createMockNucleus('book', 'Book A');
                const book2 = createMockNucleus('book', 'Book B');
                const bookFout = createMockNucleus('bookfout', 'Book not selected');
                const book3 = createMockNucleus('book', 'Book C');
                const formTree = createMockNucleus('store', null, [book1, book2, bookFout, book3]);

                const input = "These books are availible: {$.store[*].book}.";
                const result = JsonPathConverter.eval(input, formTree, { separator: ' & ' });

                expect(result).toBe("These books are availible: Book A & Book B & Book C.");
            });

            it('Use a wildcard [*] and html-tags to create a list of values.', () => {
                const prod1 = createMockNucleus('product', 'Laptop');
                const prod2 = createMockNucleus('product', 'Mouse');
                const cat = createMockNucleus('category', null, [prod1, prod2]);
                const formTree = createMockNucleus('catalog', null, [cat]);

                const input = "<ul>{$.catalog.category[*].product}</ul>";
                const result = JsonPathConverter.eval(input, formTree, {
                    separator: '',
                    openTag: '<li>',
                    closeTag: '</li>'
                });

                expect(result).toBe("<ul><li>Laptop</li><li>Mouse</li></ul>");
            });
        });

        describe('Multiple variables in one texst.', () => {
            it('Convert three variables in te same sentence.', () => {
                const userNode = createMockNucleus('user', 'Bob');
                const orderNode = createMockNucleus('orderId', 'ORD-999');
                const priceNode = createMockNucleus('total', '45.50');
                const formTree = createMockNucleus('root', null, [userNode, orderNode, priceNode]);

                const input = "Dear {$.root.user}, The order with id {$.root.orderId} has a price of {$.root.total} euro.";
                const result = JsonPathConverter.eval(input, formTree);

                expect(result).toBe("Dear Bob, The order with id ORD-999 has a price of 45.50 euro.");
            });

            it('Combine different types of variables.', () => {
                const item1 = createMockNucleus('item', 'Mouse');
                const item2 = createMockNucleus('item', 'Keyboard');
                const codeNode = createMockNucleus('coupon', 'discount 10%');
                const formTree = createMockNucleus('cart', null, [item1, item2, codeNode]);

                const input = "Product: [{$.cart[*].item}]. Code: [{$.cart.coupon}]";
                const result = JsonPathConverter.eval(input, formTree, {
                    separator: ' + ',
                    openTag: '*',
                    closeTag: '*'
                });

                expect(result).toBe("Product: [*Mouse* + *Keyboard*]. Code: [*discount 10%*]");
            });
        });
    });

});
