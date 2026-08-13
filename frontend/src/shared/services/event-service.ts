export class EventService {

    static #eventListeners: Map<string, ((value?: any) => void)[]> = new Map();

    static addEventListener(event: string, callback: (value?: any) => void) {
        if (!EventService.#eventListeners.has(event)) {
            EventService.#eventListeners.set(event, []);
        }
        EventService.#eventListeners.get(event)!.push(callback);
    }

    static emit(event: string, value: any = undefined) {
        if (EventService.#eventListeners.has(event)) {
            EventService.#eventListeners.get(event)!.forEach(callback => {
                callback(value);
            });
        }
    }

}