
import { Http } from './http.js';
import { Router } from './router.js'; 

export class Lang {
    static translation = {};

    constructor() {
    }

    static load() {
        return new Promise((resolve, reject) => {
        let language = navigator.language || navigator.userLanguage;

        Http.get(`${Router.tenantPath}/api/language/${language}`, {})
            .then(translation => {
                if (translation) {
                    this.translation = translation;
                }

                resolve();
            })
            .catch(() => {
                reject();
            });
        });
    }

    static get(key){
        return key in this.translation ? this.translation[key] : key;
    }
}