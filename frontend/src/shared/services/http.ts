import { Router } from './router';
import { ToastService } from './toast-service';

export enum ErrorType {
    TOAST = 'TOAST',
    CONSOLE = 'CONSOLE',
    DIALOG = 'DIALOG',
    VALIDATION = 'VALIDATION'
}

export class ApiError extends Error {
    status: number;
    type: ErrorType;
    timestamp: string;
    details: Map<string, any>;

    constructor(apiResponse: any) {
        super(apiResponse.error || "Er is een serverfout opgetreden");

        this.name = "ApiError";

        this.status = apiResponse.status;
        this.type = ErrorType[apiResponse?.type as keyof typeof ErrorType] ?? ErrorType.CONSOLE;
        this.timestamp = apiResponse.timestamp;
        this.details = this.#getDetailMap(apiResponse.details || {});
    }

    /**
     * This function creates an object like map structure
     * @param {*} details
     * @returns 
     */
    #getDetailMap(details: Map<string, any>): Map<string, any> {
        const fields = new Map();
        Object.entries(details).forEach(([key, waarde]) => {
            if (typeof waarde === 'string' || Array.isArray(waarde)) {
                fields.set(key, waarde);
            } else {
                fields.set(key, this.#getDetailMap(waarde));
            }
        });

        return fields;
    }

    getDetails() {
        return this.details;
    }
}

export class Http {
    static getCsrfToken() {
        const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
        return match ? decodeURIComponent(match[1]) : null;
    }


    static #request(url: string, method: string, body: any = null, options: any = {}) {
        const isObject = body !== null && typeof body === 'object';

        let defaultContentType: string | null = 'application/json';
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

                // Todo: This is a temporary solution to handle unauthorized responses. 
                // We should ideally have a more robust way to handle this globally.
                if (response.status === 401 || response.status === 403) {

                    const isLoginRequest = response.url.includes('/api/login');
                    if (isLoginRequest) {
                        return response.text().then(text => {
                            const error = this.#getContent(text);
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

                    switch (data.type) {
                        case ErrorType.TOAST:
                            ToastService.error(data?.message);
                            break;
                        case ErrorType.CONSOLE:
                            console.error(data);
                            break;
                        case ErrorType.DIALOG:
                            break;
                        case ErrorType.VALIDATION:
                            throw new ApiError(data);
                            break;
                    }

                    if (response.status === 400) {
                        throw new ApiError(data);
                    }

                    throw new Error(`Request failed with status ${response.status}`);
                });
            });
    }

    static #getContent(text: string) {
        const hasContent = text && text.trim() !== "";
        return hasContent ? JSON.parse(text) : {};
    }


    static get(url: string, options = {}) {
        return this.#request(url, 'GET', null, options);
    }

    static post(url: string, body: any, options = {}) {
        return this.#request(url, 'POST', body, options);
    }

    static delete(url: string, options = {}) {
        return this.#request(url, 'DELETE', null, options);
    }

    static put(url: string, body: any, options = {}) {
        return this.#request(url, 'PUT', body, options);
    }

    static patch(url: string, body: any, options = {}) {
        return this.#request(url, 'PATCH', body, options);
    }

    static upload(url: string, formData: FormData, onProgress = (progress: number) => { }, options: any = {}) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', url);

            // if (options.abort) {
            //     options.abort.abort = () => {
            //         xhr.abort();
            //         reject(new Error('UPLOAD_CANCELLED'));
            //     };
            // }
            const csrfToken = this.getCsrfToken();
            if (csrfToken) {
                xhr.setRequestHeader('X-XSRF-TOKEN', csrfToken);
            }

            if (options.headers) {
                Object.keys(options.headers).forEach(key => {
                    xhr.setRequestHeader(key, options.headers[key]);
                });
            }

            xhr.upload.addEventListener('progress', (event) => {
                if (event.lengthComputable) {
                    const progress = Math.round((event.loaded / event.total) * 100);
                    onProgress(progress);
                }
            });

            xhr.addEventListener('load', () => {
                const text = xhr.responseText;
                const data = this.#getContent(text);

                if (xhr.status === 401 || xhr.status === 403) {
                    const isLoginRequest = url.includes('/api/login');
                    if (isLoginRequest) {
                        reject(new Error(data.message || 'Login mislukt'));
                    } else {
                        Router.login();
                        reject(new Error(''));
                    }
                    return;
                }
                if (xhr.status >= 200 && xhr.status < 300) {
                    resolve(data);
                    return;
                }

                // Globale foutafhandeling op basis van jouw ErrorType
                switch (data.type) {
                    case ErrorType.TOAST:
                        ToastService.error(data?.message);
                        break;
                    case ErrorType.CONSOLE:
                        console.error(data);
                        break;
                    case ErrorType.DIALOG:
                        break;
                    case ErrorType.VALIDATION:
                        reject(new ApiError(data));
                        return;
                }

                if (xhr.status === 400) {
                    reject(new ApiError(data));
                } else {
                    reject(new Error(`Upload failed with status ${xhr.status}`));
                }
            });

            xhr.addEventListener('abort', () => {
                reject(new Error('UPLOAD_CANCELLED'));
            });

            xhr.addEventListener('error', () => {
                reject(new Error('Netwerkfout tijdens het uploaden.'));
            });

            xhr.send(formData);
        });
    }
}   
