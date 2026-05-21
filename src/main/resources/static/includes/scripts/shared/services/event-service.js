export class EventService {

    static #eventListeners = {};

    static addEventListener(event, callback) {
        if (!(event in EventService.#eventListeners)) {
            EventService.#eventListeners[event] = [];
        }
        EventService.#eventListeners[event].push(callback);
    }

    static emit(event, value) {
        if (event in EventService.#eventListeners) {

            EventService.#eventListeners[event].forEach(callback => {
                callback(value);
            });
        }
    }

}