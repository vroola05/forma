export class Storage {
    static page = '';


    static hasSessionItem(key: string) {
        return sessionStorage.getItem(key) !== null;
    }

    static getSessionItem(key: string) {
        return sessionStorage.getItem(key);
    }

    static setSessionItem(key: string, value: string) {
        sessionStorage.setItem(key, value);
    }

    static getPageItem(key: string) {
        return sessionStorage.getItem(Storage.page +'-'+ key);
    }

    static setPageItem(key: string, value: string) {
        sessionStorage.setItem(Storage.page +'-'+ key, value);
    }

    static removePageItem(key: string) {
        sessionStorage.removeItem(Storage.page +'-'+ key);
    }

    /**
     * Dit is eem statische methode die de huidige pagina instelt.
     * Het controleert of de nieuwe pagina verschilt van de huidige pagina.
     * Indien dit het geval is, wordt de huidige pagina gewist uit de sessionStorage.
     * Dit zorg ervoor dat de gegevens van de vorige pagina niet worden behouden.
     * @param {*} page 
     */
    static setPage(page: string) {
        const currentPage = Storage.getSessionItem('page');
        if (currentPage && page !== currentPage) {
            Storage.clearPageItems(currentPage);
        }
        Storage.setSessionItem('page', page);
        Storage.page = page;
    }

    /**
     * Verwijdert alle items uit de sessionStorage die beginnen met de opgegeven pagina naam.
     * Dit is handig om te voorkomen dat gegevens van de vorige pagina worden behouden.
     * 
     * @param {} page 
     */
    static clearPageItems(page: string) {
        Object.keys(sessionStorage).forEach(key => {
            if (key.startsWith(page)) {
                sessionStorage.removeItem(key);
            }
        });
    }

}