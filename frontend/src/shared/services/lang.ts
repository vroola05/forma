
import { Http } from './http';
import { Router } from './router'; 

export class Lang {
    static translation: Map<string, string> = new Map();

    constructor() {
    }

    static load() {
        return new Promise<void>((resolve, reject) => {
        let language = navigator.language || navigator.language;

        Http.get(`${Router.tenantPath}/api/language/${language}`, {})
            .then(translation => {
                if (translation) {
                    this.translation = new Map(Object.entries(translation));
                }

                resolve();
            })
            .catch(() => {
                reject();
            });
        });
    }

    static get(key: string, ...val: any[]): string {
        let translation = this.translation.get(key) || key;

        val.forEach(replacement => {
            translation = translation.replace('{}', replacement);
        });

        return translation;

    }
}