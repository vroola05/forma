
import { Http } from './http';
import { Router } from './router';

export class Lang {
    static #translation: Map<string, string> = new Map();

    static #defaultLocale: string = 'nl';
    static #locales: string[] = ['nl', 'en', 'de', 'pl', 'uk', 'fr', 'es', 'ro', 'it', 'pt', 'hu' ];
    
    static load() {
        return new Promise<void>((resolve, reject) => {
            const language = this.getLocale();

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

    static getDefaultLocale(): string {
        return this.#defaultLocale;
    }

    static getLocale(): string {
        const locale = new Intl.Locale(navigator.language || this.#defaultLocale).language;
        return locale
    }

    static getLocales(): string[] {
        return this.#locales;
    }
    
    static get(key: string, ...val: any[]): string {
        let translation = this.#translation.get(key) || key;

        val.forEach(replacement => {
            translation = translation.replace('{}', replacement);
        });

        return translation;

    }
}