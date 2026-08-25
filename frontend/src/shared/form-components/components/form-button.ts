import { PERMISSION } from '../../model/types';
import { Auth } from '../../services/auth';
import { Router } from '../../services/router';

export class FormButton {
    button: HTMLButtonElement = document.createElement('button');
    label: string = '';
    classes: string = '';
    path: string | null = null;
    permissions: PERMISSION[] | null = null;
    
    events: ((e?: PointerEvent | undefined) => void)[] = [];
    // event: ((e?: PointerEvent | undefined) => void) | null = null;

    constructor(label: string, classes: string | null, path: string | null = null, event: ((e?: PointerEvent | undefined) => void) | null = null, show: boolean = true) {
        this.label = label;
        this.classes = 'form-btn' + (!classes ? '' : ' ' + classes);
        this.path = path;

        this.createContent();

        this.addEvent(event);

        if (!show) {
            this.hide();
        } else {
            this.show();
        }
    }

    onClick() {

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

    addEvent(event: ((e?: PointerEvent | undefined) => void) | null = null) {
        if (event === null)
            return this;

        this.events.push(event);
        
        this.button.addEventListener('click', (e) => {
            e.preventDefault();
            
            if (!this.#checkAccess()) {
                return;
            }
          
            if (!this.events || this.events.length === 0) {
                return;
            }

            for (const event of this.events) {
                event(e);
            }
        });


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
