import { Router } from './router.js';

export class ValidationError extends Error {

    constructor(message, fields) {
        super(message);
        this.name = "ValidationError";
        
        this.fields = this.#getFieldMap(fields);
        
    }

    /**
     * This function creates an object like map structure
     * @param {*} errors 
     * @returns 
     */
    #getFieldMap(errors) {
        const fields = new Map();
        Object.entries(errors).forEach(([key, waarde]) => {
            if (typeof waarde === 'string' || Array.isArray(waarde)) {
                fields.set(key, waarde);
            } else {
                fields.set(key, this.#getFieldMap(waarde));
            }
        });

        return fields;
    }

    getFields() {
        return this.fields;
    }
}

export class Http {
    static getCsrfToken() {
        const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
        return match ? decodeURIComponent(match[1]) : null;
    }

    
    static #request(url, method, body = null, options = {}) {
        const isObject = body !== null && typeof body === 'object';

        let defaultContentType = 'application/json';
        if (body instanceof URLSearchParams) {
            defaultContentType = 'application/x-www-form-urlencoded';
        } else if (body instanceof FormData) {
            defaultContentType = null;
        }

        const headers = {
            ...options.headers
        };

        if (defaultContentType && !headers['Content-Type']) {
            headers['Content-Type'] = defaultContentType;
        }

        if (body instanceof FormData) {
            delete headers['Content-Type'];
        }

        const fetchOptions = {
            method: method,
            headers: headers,
            ...options,
            body: body
        };

        if (method !== 'GET' && body !== null) {
            fetchOptions.body = (isObject && !(body instanceof URLSearchParams || body instanceof FormData))
                ? JSON.stringify(body)
                : body;
        }

        return fetch(url, fetchOptions)
            .then(response => {
                
                // Todo: This is a temporary solution to handle unauthorized responses. We should ideally have a more robust way to handle this globally.
                if (response.status === 401 || response.status === 403) {
                    const isLoginRequest = response.url.includes('/api/login');
                    
                    if (isLoginRequest) {
                        
                        return response.text().then(text => {
                            const error = this.#getContent(text)
                            throw new Error(error.message);

                        })
                    } else {
                        Router.login();
                        throw new Error('');
                    }
                }

                return response.text().then(text => {
                    const data = this.#getContent(text);

                    if (response.ok) {
                        return data;
                    }

                    if (response.status === 400) {
                        throw new ValidationError('Validation error', data);
                    }

                    throw new Error(`Request failed with status ${response.status}`);
                });
            });
    }

    static #getContent(text) {
        const hasContent = text && text.trim() !== "";
        return  hasContent ? JSON.parse(text) : {};
    }


    static get(url, options = {}) {
        return this.#request(url, 'GET', null, options);
    }

    static post(url, body, options = {}) {
        return this.#request(url, 'POST', body, options);
    }

    static put(url, body, options = {}) {
        return this.#request(url, 'PUT', body, options);
    }

    static patch(url, body, options = {}) {
        return this.#request(url, 'PATCH', body, options);
    }
}   
