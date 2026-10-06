import { Nucleus } from "../form-components/interface/nucleus";
import { JsonPathFinder } from "./json-path-finder";


export interface ConverterOptions {
    separator?: string;
    openTag?: string;
    closeTag?: string;
}

export class JsonPathConverter {
    static readonly regex = /\{(\$\.[^{}]+)\}/g;

    static eval(text: string, input: Nucleus, options: ConverterOptions = {}) {
        const { separator = '', openTag = '', closeTag = '' } = options;

        let result: string = '';
        let lastIndex = 0;

        const matches = [...text.matchAll(JsonPathConverter.regex)];

        for (const match of matches) {
            const matchIndex = match.index ?? 0;
            const fullPlaceholder = match[0];
            const cleanJsonPath = match[1];

            if (matchIndex > lastIndex) {
                result += text.substring(lastIndex, matchIndex)
            }

            const values = JsonPathFinder.eval(cleanJsonPath, input);
            if (values ) {
                const formattedValues = values
                    .map(el => {
                        const rawValue = typeof (el as any).getValue === 'function' ? (el as any).getValue() : '';
                        
                        return rawValue !== '' ? `${openTag}${rawValue}${closeTag}` : '';
                    })
                    .filter(val => val !== '')
                    .join(separator);

                result += formattedValues;
            }

            lastIndex = matchIndex + fullPlaceholder.length;
        }

        if (lastIndex < text.length) {
            result += text.substring(lastIndex)
        }

        return result;
    }
}