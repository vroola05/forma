export class JsonPathTokenizer {
    static maxDepth = 10;

    // ^            : start of the string
    // (\*|\d+|\d*:\d+) : match either '*' OR one or more digits OR optional digits followed by ':' and digits
    // $            : end of the string
    static regexInArray = RegExp(/^(\*|\d+|\d*:\d+)$/);
    static regexNameCharacters = RegExp(/^[a-zA-Z0-9_\-\$]$/);

    static tokenize(input) {
        let output = [];
        let bracketLevel = 0;

        let token = '';
        for (let i = 0; i < input.length; i++) {
            const c = input[i];

            if (bracketLevel > 0) {
                if (c === ']') {
                    if (JsonPathTokenizer.regexInArray.test(token)) {
                        output.push('[' + token + ']');
                        token = '';
                        bracketLevel--;
                    } else {
                        throw new Error(`Syntax fout: Ongeldige index of slice ${token} op positie ${i}`);
                    }

                } else if ('0123456789:*'.includes(c)) {
                    token += c;
                } else {
                    throw new Error(`Syntax fout: Ongeldige index of slice ${token} op positie ${i}`);
                }
            } else {
                if (c == '.') {
                    // Check of we een veldnaam afsluiten
                    token = JsonPathTokenizer.handlePendingToken(token, output, i);

                    // Check op ".." (Deep Scan)
                    if (i + 1 < input.length && input[i + 1] == '.') {
                        output.push('..');
                        i++; // Sla de tweede punt over
                    }
                } else if (c == '[') {
                    // Check of de veldnaam voor de '[' niet ongeldig eindigt, bijv. "veld-"
                    token = JsonPathTokenizer.handlePendingToken(token, output, i);
                    bracketLevel++;
                } else if (c == ']') {
                    throw new Error(`Syntax fout: Sluitende haak ']' zonder opening op positie ${i}`);
                } else if (JsonPathTokenizer.regexNameCharacters.test(c)) {
                    token += c;
                } else if (c == ' ') {
                    // Sla spaties over of gooi een error afhankelijk van je voorkeur
                } else {
                    throw new Error(`Syntax fout: Karakter '${c}' niet toegestaan in veldnaam op positie  ${i}`);
                }
            }
        }

        if (output.length > JsonPathTokenizer.maxDepth) {
            throw new Error(`Limiet fout: er is een maximum diepte van ${JsonPathTokenizer.maxDepth}.`);
        }

        if (bracketLevel > 0) {
            throw new Error(`Syntax fout: Niet alle haken zijn gesloten.`);
        }

        token = JsonPathTokenizer.handlePendingToken(token, output, input.length);

        return output;
    }

    static handlePendingToken(token, output, pos) {
        if (token.length > 0) {
            if (token[token.length - 1] === '-') {
                throw new Error(`Het veld ${token} mag niet eindigen met een -`);
            }

            output.push(token);
            token = '';
        }
        return token;
    }
}