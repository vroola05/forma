export class Observable {
    #value = undefined;
    #subscribers = [];

    constructor(initialValue) {
        this.#value = initialValue;
    }

    get value() {
        return this.#value;
    }

    set value(newValue) {
        this.#value = newValue;
        this.#notify();
    }

    subscribe(callback) {
        this.#subscribers.push(callback);
        if (this.#value !== undefined) callback(this.#value);

        return () => {
            this.#subscribers = this.#subscribers.filter(s => s !== callback);
        };
    }

    #notify() {
        this.#subscribers.forEach(callback => callback(this.#value));
    }
}