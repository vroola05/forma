

export class EventService {
    static instance = null;

    eventListeners = {};

    static getInstance() {
        if (EventService.instance == null) {
            EventService.instance = new EventService();
        }
        return EventService.instance;
    }

    constructor() {
        
    }

    addEventListener(event, callback) {
        if (!(event in this.eventListeners)) {
            this.eventListeners[event] = [];
        }
        this.eventListeners[event].push(callback);
    }

    callEventListener(event, value) {
        if (event in this.eventListeners) {
            this.eventListeners[event].forEach(callback => {
                callback(value);
            });
        }
    }

}