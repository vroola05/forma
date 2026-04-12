import { Router } from '../../shared/services/router.js';
import { EventService } from '../../shared/services/event-service.js';
import { Lang } from '../../shared/services/lang.js';
import { FormButton } from './form-button.js';

export class Header {
    
    constructor() {
        this.createContent();

        EventService.addEventListener('header-buttons-right', (a, b) => {
            this.navbarNavRight.innerHTML = '';
            for (const formButton of a) {
                this.navbarNavRight.appendChild(this.getNavBarItem(formButton));
            }
        });
    }

    createContent() {
        this.navbar = document.createElement('nav');
        this.navbar.className = 'navbar navbar-expand-lg navbar-dark shadow';

        const navbarInner = document.createElement('div');
        navbarInner.className = 'container-fluid';
        this.navbar.appendChild(navbarInner);

        const navbarToggler = document.createElement('button');
        navbarToggler.className = 'navbar-toggler';
        navbarToggler.type = 'button';
        navbarToggler.ariaControls='navbarNav';
        navbarToggler.ariaExpanded='false';
        navbarToggler.ariaLabel='Toggle navigation';
        navbarToggler.setAttribute('data-bs-toggle', 'collapse');
        navbarToggler.setAttribute('data-bs-target', '#navbarNav');
        navbarToggler.innerHTML = '<span class="navbar-toggler-icon"></span>';
        navbarInner.appendChild(navbarToggler);

        const navbarCollapse = document.createElement('div');
        navbarCollapse.id = 'navbarNav';
        navbarCollapse.className = 'collapse navbar-collapse';

        this.navbarNavLeft = document.createElement('ul');
        this.navbarNavLeft.className = 'navbar-nav';
        navbarCollapse.appendChild(this.navbarNavLeft);
        this.setLeftButtons();

        this.navbarNavRight = document.createElement('ul');
        this.navbarNavRight.className = 'navbar-nav ms-auto';
        navbarCollapse.appendChild(this.navbarNavRight);

        navbarInner.appendChild(navbarCollapse);
    }

    setLeftButtons() {
        this.navbarNavLeft.appendChild(this.getNavBarItem(new FormButton(Lang.get('header.home'), 'home', Router.base + '/admin')));
    }

    getNavBarItem(formButton) {
        const navItem = document.createElement('li');
        navItem.className = 'nav-item';

        const navLink = document.createElement('a');
        navLink.className = 'nav-link' + (formButton.classes ? ' ' + formButton.classes : '');
        navLink.innerText = formButton.label;
        if (formButton.path !== null) {
            navLink.href = formButton.path;
        }
        if (formButton.event) {
            navLink.addEventListener('click', (e) => {
                e.preventDefault();
                formButton.event();
            });
        }
        navItem.appendChild(navLink);
        return navItem;
    }

    getOption(value, label, disabled, selected) {
        const option = document.createElement('option');
        option.value = value;
        option.innerText = label;
        if (disabled) {
            option.disabled = true;
        }
        if (selected) {
            option.selected = true;
        }
        return option;
    }

    getContent() {
        return this.navbar;
    }
}
