import { Router } from '../../services/router.js';
import { Auth } from '../../services/auth.js';

export class FormButton {
    button = document.createElement('button');
    label = '';
    classes = '';
    path = '';
    event = null;
    

    constructor(label, classes, path = null, event = null, show = true) {
        this.label = label;
        this.classes = 'form-btn' + (!classes ? '' : ' ' + classes);
        this.path = path;
        this.event = event;
        
        this.createContent();

        if (!show) {
            this.hide();
        } else {
            this.show();
        }
    }

    setPermissions(...permissions) {
        this.permissions = permissions.flat().filter(p => p != null);

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
    }

    hide() {
        this.button.classList.add('hidden');
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
                Router.route(this.path);
            });
        }
        if (this.event) {
            this.button.addEventListener('click', (e) => {
                e.preventDefault();

                if (!this.#checkAccess()) {
                    return;
                }

                this.event();
            });
        }
    }

    getContent() {
        return this.button;
    }
}
