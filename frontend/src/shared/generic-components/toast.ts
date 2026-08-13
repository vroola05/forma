import { ToastService } from '../services/toast-service';

export class Toast {
     #toastContainer = document.createElement('div');

    constructor() {
        this.#toastContainer.className = 'toaster-container';

        ToastService.subscribe((messages) => {
            this.#toastContainer.innerHTML = '';
            if (messages) {
                messages.forEach(m => {
                    this.#createMessage(m.id, m.message, m.type);
                });
            }
        });
    }

    #createMessage(id: number, message: string, type: string) {
        const toast = document.createElement('div');
        toast.className = `toaster alert-${type}`;
        toast.role = 'alert';
        toast.dataset.msgId = id.toString();

        
        const messaggeContainer = document.createElement('div');
        messaggeContainer.className = 'toaster-message';
        messaggeContainer.innerHTML = message;
        
        toast.appendChild(messaggeContainer);

        const btnContainer = document.createElement('div');
        btnContainer.className = 'toaster-btn-container';
        toast.appendChild(btnContainer);

        const button = document.createElement('button');
        button.className = 'btn-close';
        button.setAttribute('aria-label', 'Close');
        
        button.addEventListener('click', (e) => {
            e.preventDefault();

            const currentToast = (e.target as Element)?.closest('.toaster');
            if (currentToast)
                currentToast?.parentNode?.removeChild(currentToast);

            ToastService.remove(Number(toast.dataset.msgId));
        });

        btnContainer.appendChild(button);

        this.#toastContainer.appendChild(toast);
    }

    getContent() {
        return this.#toastContainer;
    }
}