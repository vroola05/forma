import { Observable } from "./observable.js";

class HeaderService {
    #logo = new Observable(undefined);
    constructor() { 
    }

    setLogo(logoSrc) {
        this.#logo.value = logoSrc;
    }

    logoSubscribe(callback) {
        this.#logo.subscribe(callback);
    }
}

export const headerService = new HeaderService();
