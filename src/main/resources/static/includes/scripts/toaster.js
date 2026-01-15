

export class Toaster {
    static #toasts = [];
    static #toastContainer = document.getElementById('toast-container');

    constructor() {
    }

    static #createMessage(message, type) {
        const toast = document.createElement('div');
        toast.className = `toaster alert alert-${type} alert-dismissible fade show`;
        toast.role = type;

        const messaggeContainer = document.createElement('div');
        messaggeContainer.innerHTML = message;
        toast.appendChild(messaggeContainer);

        const button = document.createElement('button');
        button.innerHTML = '<span aria-hidden="true">&times;</span>';
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const toastClicked = e.target.closest('.toaster');
            Toaster.#removeMessage(toastClicked);

        });
        toast.appendChild(button);

        const timeout = setTimeout(() => {
            Toaster.#removeMessage(toast);
        }, 20000);

        Toaster.#toasts.push({
            timeout,
            toast
        });

        Toaster.#toastContainer.appendChild(toast);
    }

    static #removeMessage(toast) {
        const t = Toaster.#toasts.find(item => item.toast === toast);

        if (t) {
            clearTimeout(t.timeout);
            const index = Toaster.#toasts.indexOf(t);
            if (index > -1) {
                Toaster.#toasts.splice(index, 1);
                toast.remove();
            }
        }
    }

    static error(message) {
        Toaster.#createMessage(message, 'danger');
    }

    static info(message) {
        Toaster.#createMessage(message, 'primary');
    }
}