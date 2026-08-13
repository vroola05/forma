import { InputNucleus } from '../form-components/interface/input-base';
import { Nucleus } from '../form-components/interface/nucleus';
import { JsonPathTokenizer } from './json-path-tokenizer';

export class JsonPathFinder {

    static evalTokenized(path: string, input: Nucleus): InputNucleus[] {
        const results: InputNucleus[] = [];
        
       JsonPathFinder.evaluateRecursive(JsonPathTokenizer.tokenize(path), 0, input, results);
        return results;
    }
    
    static evaluateRecursive(tokens: string[], tokenIndex: number, currentField: Nucleus, results: Nucleus[]) {
        if (tokenIndex >= tokens.length - 1) {
            if (tokens[tokens.length - 1] === currentField.getName()) {
                results.push(currentField);
            }
            return;
        }

        const token = tokens[tokenIndex];

        if ('$' === token) {
           JsonPathFinder.evaluateRecursive(tokens, tokenIndex + 1, currentField, results);
            return;
        }

        if ('..' === token) {
            if (tokenIndex + 1 >= tokens.length) {
                throw new Error('Pad mag niet eindigen met ..');
            }
            
            const nextToken = tokens[tokenIndex + 1];
            
            // Zoek recursief in de hele boom naar velden die matchen met nextToken
           JsonPathFinder.searchDeep(currentField, nextToken, tokens, tokenIndex + 2, results);
            return;
        }


        if (token.startsWith('[')) {
            const children = currentField.getFields();
            if (!children || children.length === 0) {
                return;
            }

            const content = token.substring(1, token.length - 1);

            if ('*' === content) {
                for (const child of children) {
                   JsonPathFinder.evaluateRecursive(tokens, tokenIndex + 1, child, results);
                }
            } else if (content.includes(':')) {
                // Slice logica (bijv. 0:5)
                const parts = content.split(':', -1);
                const start = parts[0].length === 0 ? 0 : Number(parts[0]);
                const end = parts[1].length === 0 ? children.length : Number(parts[1]);

                for (let i = Math.max(0, start); i < Math.min(children.length, end); i++) {
                   JsonPathFinder.evaluateRecursive(tokens, tokenIndex + 1, children[i], results);
                }
            } else {
                // Harde index (bijv. [2])
                const idx = Number(content);
                if (idx >= 0 && idx < children.length) {
                   JsonPathFinder.evaluateRecursive(tokens, tokenIndex + 1, children[idx], results);
                }
            }
            return;
        }

        if (token === currentField.name) {
            // Als de huidige token matcht met de huidige field-naam,
            // gaan we naar de volgende token met de kinderen van dit veld.
            const children = currentField.getFields();
            if (children !== null) {
                for (const child of children) {
                   JsonPathFinder.evaluateRecursive(tokens, tokenIndex + 1, child, results);
                }
            }
        }

        return;
    }

    static searchDeep(root: Nucleus, targetName: string, tokens: string[], nextTokenIdx: number, results: Nucleus[]) {
        if (targetName === root.name) {
           JsonPathFinder.evaluateRecursive(tokens, nextTokenIdx, root, results);
        }

        const children = root.getFields();
        if (children !== null) {
            for (const child of children) {
               JsonPathFinder.searchDeep(child, targetName, tokens, nextTokenIdx, results);
            }
        }
    }
}