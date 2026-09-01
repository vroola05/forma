import { FormButton } from "../form-components/components/form-button";

class FooterService {
    buttons: { left: FormButton[]; right: FormButton[] };
    listeners: ((buttons: { left: FormButton[]; right: FormButton[] }) => void)[];
    constructor() {
        this.buttons = { left: [], right: [] };
        this.listeners = [];
    }

    addButtonLeft(button: FormButton) {
        this.buttons.left.push(button);
        this.notify();
    }

    addButtonRight(button: FormButton) {
        this.buttons.right.push(button);
        this.notify();
    }

    clear() {
        this.buttons = { left: [], right: [] };
        this.notify();
        this.listeners = [];
    }
    
    notify() {
        this.listeners.forEach(callback => callback(this.buttons));
    }

    subscribe(callback: (buttons: { left: FormButton[]; right: FormButton[] }) => void) {
        this.listeners.push(callback);
    }
}

export const footerService = new FooterService();
