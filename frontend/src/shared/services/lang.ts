
import { Http } from './http';
import { Router } from './router';

export class Lang {
    static #translation: Map<string, string> = new Map();

    static #lang_codes: string[] = ['nl', 'en', 'de', 'pl', 'uk', 'fr', 'es', 'ro', 'it', 'pt', 'hu' ];
    
    constructor() {
    }

    static load() {
        return new Promise<void>((resolve, reject) => {
            const browserLang = navigator.language || 'en';
            const language = new Intl.Locale(browserLang).language;

            Http.get(`${Router.tenantPath}/api/language/${language}`, {})
                .then(translation => {
                    if (translation) {
                        this.#translation = new Map(Object.entries(translation));
                    }

                    resolve();
                })
                .catch(() => {
                    reject();
                });
        });
    }

    static geDefaultLanguages(): string[] {
        return this.#lang_codes;
    }
    
    static get(key: string, ...val: any[]): string {
        let translation = this.#translation.get(key) || key;

        val.forEach(replacement => {
            translation = translation.replace('{}', replacement);
        });

        return translation;

    }
}