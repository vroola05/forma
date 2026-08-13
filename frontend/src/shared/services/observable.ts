export class Observable<T> {
    #value: T | undefined = undefined;
    #subscribers: ((value: T | undefined) => void)[] = [];

    constructor(initialValue: T | undefined = undefined) {
        this.#value = initialValue;
    }

    get value() {
        return this.#value;
    }

    set value(newValue: T | undefined) {
        this.#value = newValue;
        this.#notify();
    }

    subscribe(callback: (value: T | undefined) => void): () => void {
        this.#subscribers.push(callback);
        if (this.#value !== undefined) {
            callback(this.#value);
        }

        
        return () => {
            this.#subscribers = this.#subscribers.filter(s => s !== callback);
        };
    }

    #notify() {
        this.#subscribers.forEach(callback => callback(this.#value));
    }
}