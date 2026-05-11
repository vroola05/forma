
export class ValidationError extends Error {

    constructor(message, fields) {
        super(message);
        this.name = "ValidationError";
        this.fields = new Map();
        Object.entries(fields).forEach(([key, waarde]) => {
            this.fields.set(key, waarde);
        });
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

    static post(url, body, options = {}) {
        const isObject = body !== null && typeof body === 'object';

        return fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: isObject ? JSON.stringify(body) : body
        })
            .then(response => {
                if (response.ok) return response.json();
                throw new Error('Request failed');
            });
    }

    static put(url, body, options = {}) {

        const isObject = body !== null && typeof body === 'object';

        
        return fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: isObject ? JSON.stringify(body) : body
        })
            .then(response => {
                if (response.ok) return response.json();
                if (response.status == 400) {
                    return response.json().then(errorData => {
                        throw new ValidationError('Validation error', errorData);
                    });
                }
                throw new Error('Request failed');
            });
    }

    static get(url, options = {}) {
        return fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(response => {
                if (response.ok) return response.json();
                throw new Error('Request failed');
            });
    }
}
