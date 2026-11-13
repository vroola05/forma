export class JsonPathTokenizer {
    static readonly maxDepth = 10;

    static readonly regexInArray = new RegExp(/^(\*|\d+|\d*:\d+)$/);
    static readonly regexNameCharacters = new RegExp(/^[a-zA-Z0-9_\-$]$/);

    readonly #input: string;
    readonly #output: string[] = [];
    #token = '';
    #bracketLevel = 0;
    #i = 0;

    private constructor(input: string) {
        this.#input = input;
    }

    static tokenize(input: string): string[] {
        const instance = new JsonPathTokenizer(input);
        return instance.#run();
    }

    /**
     * Main loop
     */
    #run(): string[] {
        for (this.#i = 0; this.#i < this.#input.length; this.#i++) {
            const c = this.#input[this.#i];

            if (this.#bracketLevel > 0) {
                this.#handleBracketState(c);
            } else {
                this.#handleNormalState(c);
            }
        }

        this.#validateAndFinalize();
        return this.#output;
    }

    /**
     * Logic within the brackets [ and ]
     */
    #handleBracketState(c: string): void {
        if (c === ']') {
            if (JsonPathTokenizer.regexInArray.test(this.#token)) {
                this.#output.push('[' + this.#token + ']');
                this.#token = '';
                this.#bracketLevel--;
            } else {
                throw new Error(`Syntax fout: Ongeldige index of slice ${this.#token} op positie ${this.#i}`);
            }
        } else if ('0123456789:*'.includes(c)) {
            this.#token += c;
        } else {
            throw new Error(`Syntax fout: Ongeldige index of slice ${this.#token} op positie ${this.#i}`);
        }
    }

    /**
     * 
     */
    #handleNormalState(c: string): void {
        if (c === '.') {
            this.#handlePendingToken();

            if (this.#i + 1 < this.#input.length && this.#input[this.#i + 1] === '.') {
                this.#output.push('..');
                this.#i++;
            }
        } else if (c === '[') {
            this.#handlePendingToken();
            this.#bracketLevel++;
        } else if (c === ']') {
            throw new Error(`Syntax fout: Sluitende haak ']' zonder opening op positie ${this.#i}`);
        } else if (JsonPathTokenizer.regexNameCharacters.test(c)) {
            this.#token += c;
        } else {
            throw new Error(`Syntax fout: Karakter '${c}' niet toegestaan in veldnaam op positie ${this.#i}`);
        }
    }

    /**
     * Adds the token to the output string and clears the token
     */
    #handlePendingToken(): void {
        if (this.#token.length > 0) {
            if (this.#token.endsWith('-')) {
                throw new Error(`Het veld ${this.#token} mag niet eindigen met een -`);
            }

            this.#output.push(this.#token);
            this.#token = '';
        }
    }

    /**
     * Eindvalidaties
     */
    #validateAndFinalize(): void {
        if (this.#bracketLevel > 0) {
            throw new Error(`Syntax fout: Niet alle haken zijn gesloten.`);
        }

        this.#handlePendingToken();

        if (this.#output.length > JsonPathTokenizer.maxDepth) {
            throw new Error(`Limiet fout: er is een maximum diepte van ${JsonPathTokenizer.maxDepth}.`);
        }
    }
}
