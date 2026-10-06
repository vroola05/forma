import type { Nucleus } from '../form-components/interface/nucleus';
import { JsonPathTokenizer } from './json-path-tokenizer';

export class JsonPathFinder {
    
    readonly #tokens: string[];
    readonly #results: Nucleus[] = [];

    private constructor(tokens: string[]) {
        this.#tokens = tokens;
    }

    /**
     * Entrance
     */
    static eval(path: string, input: Nucleus): Nucleus[] {
        const tokens = JsonPathTokenizer.tokenize(path);
        const finder = new JsonPathFinder(tokens);
        return finder.#run(input);
    }

    #run(input: Nucleus): Nucleus[] {
        this.#evalTokens(0, input);
        return this.#results;
    }

    #hasToken(index: number): boolean {
        return this.#tokens && index <= this.#tokens.length - 1;
    }

    #getToken(index: number): string | undefined {
        if (!this.#hasToken(index))
            return undefined;
        return this.#tokens[index];
    }


    /**
     * Main recursive loop that loops through the tokens and fills the result array
     */
    #evalTokens(tokenIndex: number, currentField: Nucleus): void {
        const token = this.#getToken(tokenIndex);

        if (token === '..') {
            this.#handleDeepScan(tokenIndex, currentField);
            return;
        }

        if (!this.#hasToken(tokenIndex + 1)) {
            if (this.#tokens[this.#tokens.length - 1] === currentField.getName()) {
                this.#results.push(currentField);
            }
            return;
        }

        if (token === '$') {
            this.#evalTokens(tokenIndex + 1, currentField);
            return;
        }

        if (token === currentField.name) {
            this.#evaluateChildren(tokenIndex + 1, currentField);
        }
    }

    /**
     * Deepscan all objects for specific fields
     * Example:
     * - $.form..surname
     *   returns all fields with the name 'surname' starts deepsearch from
     *   the field 'form'
     * 
     * - $.form.tab..person.surname 
     *   returns all fields with the name 'surname' within a field with the 
     *   name person starts deepsearch from the field 'form'
     */
    #handleDeepScan(tokenIndex: number, currentField: Nucleus): void {
        if (tokenIndex + 1 >= this.#tokens.length) {
            throw new Error('A path can\'t end with ..');
        }

        const nextToken = this.#tokens[tokenIndex + 1];

        this.#searchDeep(currentField, nextToken, tokenIndex + 2);
    }

    /**
     * Returns a list of Nucleus objects based on the parameters given within
     * the brackets [ and ]
     * @param token 
     * @param children 
     * @returns 
     */
    #getBracketList(token: string, children: Nucleus[] | null): Nucleus[] {
        if (children === null) {
            return [];
        }

        const content = token.substring(1, token.length - 1);
        if (content === '*') {
            return children;
        } else if (content.includes(':')) {
            return this.#getBracketListSlice(content, children);
        } else {
            return this.#getBracketListOfOne(content, children);
        }
    }

    /**
     * Returns a list of Nucleus objects based on NUMBER:NUMBER
     * @param content 
     * @param children 
     * @returns 
     */
    #getBracketListSlice(content: string, children: Nucleus[]): Nucleus[] {
        const parts = content.split(':', -1);
        const start = parts[0].length === 0 ? 0 : Number(parts[0]);
        const end = parts[1].length === 0 ? children.length : Number(parts[1]);

        const safeStart = Math.max(0, start);
        const safeEnd = Math.min(children.length, end);

        return children.slice(safeStart, safeEnd);
    }


    #getBracketListOfOne(content: string, children: Nucleus[]): Nucleus[] {
        const index = Number(content);
        if (index >= 0 && index < children.length) {
            return [children[index]];
        }
        return [];
    }

    /**
     * Recursively evaluate all children
     */
    #evaluateChildren(nextTokenIndex: number, currentField: Nucleus): void {
        const children = currentField.getFields();
        if (!children || children.length === 0) return;

        const nextToken = this.#getToken(nextTokenIndex);

        // 1: If the next token is an array expression like [1], [0:1] of [*]
        if (nextToken?.startsWith('[')) {
            const bracketChildren = this.#getBracketList(nextToken, children);
            if (!bracketChildren || bracketChildren.length === 0) return;

            const bracketTokenIndex = nextTokenIndex + 1;
            if (!this.#hasToken(bracketTokenIndex)) {
                this.#results.push(...(bracketChildren));
                return;
            }

            for (const child of bracketChildren) {
                this.#evalTokens(bracketTokenIndex, child);
            }
            return;
        }

        // 2: Normal expression
        for (const child of children) {
            this.#evalTokens(nextTokenIndex, child);
        }
    }


    /**
     * Zoekt diep in de boomstructuur naar een specifiek doelveld
     */
    #searchDeep(root: Nucleus, targetName: string, nextTokenIdx: number): void {
        if (targetName === root.name) {
            this.#evalTokens(nextTokenIdx, root);
        }

        const children = root.getFields();
        if (children !== null) {
            for (const child of children) {
                this.#searchDeep(child, targetName, nextTokenIdx);
            }
        }
    }
}
