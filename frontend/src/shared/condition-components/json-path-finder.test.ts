import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Nucleus } from '../form-components/interface/nucleus';
import { JsonPathFinder } from './json-path-finder';
import { JsonPathTokenizer } from './json-path-tokenizer';

vi.mock('./json-path-tokenizer', () => {
    return {
        JsonPathTokenizer: {
            tokenize: vi.fn()
        }
    };
});

function createMockNucleus(name: string, children: any[] = []): Nucleus {
    return {
        name: name,
        getName: () => name,
        getFields: () => children.length > 0 ? children : null,
    } as unknown as Nucleus;
}

describe('JsonPathFinder', () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Receive a single element', () => {
        it('Should find the root element when given a simple path', () => {

            vi.mocked(JsonPathTokenizer.tokenize).mockReturnValue(['$', 'store']);
            const tree = createMockNucleus('store', []);

            const result = JsonPathFinder.eval('$.store', tree);

            expect(result).toHaveLength(1);
            expect(result[0].getName()).toBe('store');
        });

        it('Should find the a chapter element when given a simple path with nested structure', () => {
            vi.mocked(JsonPathTokenizer.tokenize).mockReturnValue(['$', 'store', 'book', 'chapter']);
            
            const chapterNode = createMockNucleus('chapter', []);
            const bookNode = createMockNucleus('book', [chapterNode]);
            const storeNode = createMockNucleus('store', [bookNode]);

            const result = JsonPathFinder.eval('$.store.book.chapter', storeNode);

            expect(result).toHaveLength(1);
            expect(result[0].getName()).toBe('chapter');
        });
    });

    describe('Array and Bracket [ ] logic', () => {
        it('Should receive a all child of a hard index [1]', () => {
            vi.mocked(JsonPathTokenizer.tokenize).mockReturnValue(['$', 'store', '[1]']);
            
            const book0 = createMockNucleus('bookA');
            const book1 = createMockNucleus('bookB');
            const storeNode = createMockNucleus('store', [book0, book1]);

            const result = JsonPathFinder.eval('$.store[1]', storeNode);

            expect(result).toHaveLength(1);
            expect(result[0].getName()).toBe('bookB');
        });
        it('Should receive a specific child of a hard index [1] with the name bookB', () => {
            vi.mocked(JsonPathTokenizer.tokenize).mockReturnValue(['$', 'store', '[1]', 'bookB']);
            
            const book0 = createMockNucleus('bookA');
            const book1 = createMockNucleus('bookB'); // Deze verwachten we
            const storeNode = createMockNucleus('store', [book0, book1]);

            const result = JsonPathFinder.eval('$.store[1].bookB', storeNode);

            expect(result).toHaveLength(1);
            expect(result[0].getName()).toBe('bookB');
        });

        it('Should return all children when given a wildcard [*]', () => {
            vi.mocked(JsonPathTokenizer.tokenize).mockReturnValue(['$', 'store', '[*]']);
            
            const book0 = createMockNucleus('bookA');
            const book1 = createMockNucleus('bookB');
            const storeNode = createMockNucleus('store', [book0, book1]);

            const result = JsonPathFinder.eval('$.store[*]', storeNode);

            expect(result).toHaveLength(2);
            expect(result[0].getName()).toBe('bookA');
            expect(result[1].getName()).toBe('bookB');
        });

        it('Should return a slice [0:2] of the array', () => {
            vi.mocked(JsonPathTokenizer.tokenize).mockReturnValue(['$', 'store', '[0:2]']);
            
            const child0 = createMockNucleus('A');
            const child1 = createMockNucleus('B');
            const child2 = createMockNucleus('C');
            const tree = createMockNucleus('store', [child0, child1, child2]);

            const result = JsonPathFinder.eval('$.store[0:2]', tree);

            expect(result).toHaveLength(2);
            expect(result[0].getName()).toBe('A');
            expect(result[1].getName()).toBe('B');
        });
    });

    describe('Deep Scan (..) logic', () => {
        it('Loop recursively through the tree to find a specific field', () => {
            vi.mocked(JsonPathTokenizer.tokenize).mockReturnValue(['$', '..', 'target']);
            
            // Treestructure: store -> sub -> target
            const targetNode = createMockNucleus('target');
            const subNode = createMockNucleus('sub', [targetNode]);
            const tree = createMockNucleus('store', [subNode]);

            const result = JsonPathFinder.eval('$..target', tree);

            expect(result).toHaveLength(1);
            expect(result[0].getName()).toBe('target');
        });

        it('Loop recursively through a deeper tree to find a specific field', () => {
            vi.mocked(JsonPathTokenizer.tokenize).mockReturnValue(['$', '..', 'target']);
            
            // Treestructure: store -> sub -> sub -> target
            const targetNode = createMockNucleus('target');
            const targetNode1 = createMockNucleus('target');
            const subSubNode = createMockNucleus('sub', [targetNode, targetNode1]);
            const subNode = createMockNucleus('sub', [subSubNode]);
            const tree = createMockNucleus('store', [subNode]);

            const result = JsonPathFinder.eval('$..target', tree);

            expect(result).toHaveLength(2);
            expect(result[0].getName()).toBe('target');
        });

        it('Should crash if the path ends with ..', () => {
            vi.mocked(JsonPathTokenizer.tokenize).mockReturnValue(['$', '..']);
            const tree = createMockNucleus('store', []);

            expect(() => {
                JsonPathFinder.eval('$..', tree);
            }).toThrow('A path can\'t end with ..');
        });
    });
});
