class FooterService {
    constructor() {
        this.buttons = { left: [], right: [] };
        this.listeners = [];
    }

    addButtonLeft(button) {
        this.buttons.left.push(button);
        this.notify();
    }

    addButtonRight(button) {
        this.buttons.right.push(button);
        this.notify();
    }

    clear() {
        this.buttons = { left: [], right: [] };
        this.notify();
    }

    notify() {
        this.listeners.forEach(callback => callback(this.buttons));
    }

    subscribe(callback) {

        this.listeners.push(callback);
    }
}

export const footerService = new FooterService();
