import { Router } from '../../services/router';
import { Auth } from '../../services/auth';
import { PERMISSION } from '../../model/types';

export class FormButton {
    button: HTMLButtonElement = document.createElement('button');
    label: string = '';
    classes: string = '';
    path: string | null = null;
    permissions: PERMISSION[] | null = null;
    
    event: (() => void) | null = null;

    constructor(label: string, classes: string | null, path: string | null = null, event: (() => void) | null = null, show: boolean = true) {
        this.label = label;
        this.classes = 'form-btn' + (!classes ? '' : ' ' + classes);
        this.path = path;

        this.createContent();

        this.setEvent(event);

        if (!show) {
            this.hide();
        } else {
            this.show();
        }
    }

    setPermissions(...permissions: (PERMISSION | null)[]) {
        this.permissions = permissions.flat().filter((p): p is PERMISSION => !!p);

        this.#checkAccess();
        return this;
    }

    #checkAccess() {
        
        if (this.permissions && this.permissions.length > 0 && !Auth.hasAnyPermission(...this.permissions)) {
            this.hide();
            return false;
        } else {
            this.show();
            return true;
        }
    }

    show() {
        this.button.classList.remove('hidden');
        return this;
    }

    hide() {
        this.button.classList.add('hidden');
        return this;
    }

    setEvent(event: (() => void) | null = null) {
        if (this.event) {
            this.button.removeEventListener('click', this.event);
        }

        this.event = event;

        if (this.event) {
            this.button.addEventListener('click', (e) => {
                e.preventDefault();

                if (!this.#checkAccess()) {
                    return;
                }

                if (this.event) {
                    this.event();
                }
            });
        }

        return this;
    }

    createContent() {
        this.button.className = (this.classes ? ' ' + this.classes : '');
        this.button.innerText = this.label;
        if (this.path !== null) {
            this.button.addEventListener('click', (e) => {
                e.preventDefault();

                if (!this.#checkAccess()) {
                    return;
                }
                if (this.path) {
                    Router.route(this.path);
                }
            });
        }
        
    }

    getContent() {
        return this.button;
    }
}
