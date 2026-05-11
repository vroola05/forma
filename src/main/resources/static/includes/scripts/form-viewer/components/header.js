import { Router } from '../../shared/services/router.js';
import { EventService } from '../../shared/services/event-service.js';
import { Lang } from '../../shared/services/lang.js';
import { FormButton } from './form-button.js';

export class Header {
    
    constructor() {
        this.createContent();

        EventService.addEventListener('header-home', (homeUrl) => {
            this.navbarNavLeft.appendChild(this.getNavBarItem(new FormButton(Lang.get('header.home'), 'home', homeUrl)));
        });
        
        EventService.addEventListener('header-buttons-left', (formButtons) => {
            this.navbarNavLeft.innerHTML = '';
            for (const formButton of formButtons) {
                this.navbarNavLeft.appendChild(this.getNavBarItem(formButton));
            }
        });

        EventService.addEventListener('header-buttons-right', (formButtons) => {
            this.navbarNavRight.innerHTML = '';
            for (const formButton of formButtons) {
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


        

        this.navbarNavLeft = document.createElement('ul');
        this.navbarNavLeft.className = 'navbar-nav';
        navbarInner.appendChild(this.navbarNavLeft);
        
        this.navbarNavRight = document.createElement('ul');
        this.navbarNavRight.className = 'navbar-nav ms-auto';
        navbarInner.appendChild(this.navbarNavRight);
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
