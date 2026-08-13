import { Observable } from './observable';

export interface ToastItem {
    id: number;
    message: string;
    type: string; // Dit dwingt af dat het een geldige enum-waarde is (bijv. ErrorType.TOAST)
}

export class ToastService {
    static #counter = 0;
    static #toasts = new Observable<ToastItem[]>([]);

    static subscribe(fnc: (toasts: ToastItem[] | undefined) => void) {
        return this.#toasts.subscribe(fnc);
    }

    static remove(id: number) {
        const timeout = setTimeout(() => {
            const value = this.#toasts.value;
            if (!value) {
                return;
            }
            
            const t = value.find(item => item.id === id);
            if (t) {
                clearTimeout(timeout);
                const index = value.indexOf(t);
                if (index > -1) {
                    value.splice(index, 1);
                    this.#toasts.value = value;
                }
            }
        }, 20000);
    }

    static #push(message: string, type: string) {
        if (!this.#toasts.value) {
            return;
        }

        const id = this.#counter++;
        const valueObj = {id: id, message: message, type};

        const value = this.#toasts.value;
        value.push(valueObj);
        this.#toasts.value = value;
        
        this.remove(id);

        return id;
    }

    static clear() {
        this.#counter = 0;
        this.#toasts.value = [];
    }

    static error(message: string) {
        return this.#push(message, 'error');
    }

    static info(message: string) {
        return this.#push(message, 'info');
    }
}