import { FormButton } from "../form-components/components/form-button";
import { PERMISSION } from "../model/types";
import { Auth } from "../services/auth";


export class Dropdown {
    #dropdown = document.createElement('div');
    #dropdownBtn = document.createElement('button');
    #dropdwonMenu = document.createElement('ul');
    isOpen: boolean = false;
    permissions: PERMISSION[] | null = null;

    #clickOutsideMenu = (event: MouseEvent) => {
        if (this.#dropdwonMenu
            && !this.#dropdwonMenu.contains(event.target as Node)) {
            this.#close();
        }
    };

    constructor(label: string, formButtons: FormButton[]) {

        this.#dropdown.className = 'dropdown';

        this.#dropdownBtn.setAttribute('aria-haspopup', 'true');
        this.#dropdownBtn.setAttribute('aria-expanded', 'false');
        this.#dropdownBtn.className = 'dropdown-menu-btn icon';
        this.#dropdown.appendChild(this.#dropdownBtn);

        this.#dropdownBtn.addEventListener('click', () => {
            if (this.isOpen)
                return;

            this.isOpen = true;
            this.#open();
        });
        

        const dropdownBtnLabel = document.createElement('span');
        dropdownBtnLabel.className = 'dropdown-label';
        dropdownBtnLabel.innerText = label;
        this.#dropdownBtn.appendChild(dropdownBtnLabel);

        const dropdownBtnChevron = document.createElement('span');
        dropdownBtnChevron.className = 'dropdown-label-icon';
        dropdownBtnChevron.innerHTML = '&#9662;';
        this.#dropdownBtn.appendChild(dropdownBtnChevron);

        this.#dropdwonMenu.className = 'dropdown-menu';
        this.#dropdown.appendChild(this.#dropdwonMenu);

        for(const formButton of formButtons) {
            this.#dropdwonMenu.appendChild(this.getNavBarItem(formButton));
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
        this.#dropdown.classList.remove('hidden');
        return this;
    }

    hide() {
        this.#dropdown.classList.add('hidden');
        return this;
    }

    #open() {
        this.#dropdownBtn.setAttribute('aria-expanded', 'true');
        this.#dropdwonMenu.classList.add('active');

        setTimeout(() => {
            document.addEventListener('click', this.#clickOutsideMenu);
        }, 0);
    }

    #close() {
        this.#dropdownBtn.setAttribute('aria-expanded', 'false');
        this.#dropdwonMenu.classList.remove('active');

        document.removeEventListener('click', this.#clickOutsideMenu);
        this.isOpen = false;
    }

    getNavBarItem(menuItem: (FormButton)) {
        const navItem = document.createElement('li');
        navItem.className = 'nav-item';
        menuItem.addEvent(() => {
            console.log('aaaaaaaa');
            this.#close();
        });

        navItem.appendChild(menuItem.getContent());
        return navItem;
    }

    getContent() {
        return this.#dropdown;
    }
}