import { Observable } from "./observable";

class HeaderService {
    #logo = new Observable<string | undefined>(undefined);
    constructor() { 
    }

    setLogo(logoSrc: string) {
        this.#logo.value = logoSrc;
    }

    logoSubscribe(callback: (value: string | undefined) => void) {
        this.#logo.subscribe(callback);
    }
}

export const headerService = new HeaderService();
