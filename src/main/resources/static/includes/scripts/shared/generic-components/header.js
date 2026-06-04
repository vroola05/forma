import { Router } from '../../shared/services/router.js';
import { EventService } from '../../shared/services/event-service.js';
import { Lang } from '../../shared/services/lang.js';
import { FormButton } from '../../shared/form-components/components/form-button.js';
import { Auth } from '../services/auth.js';
import { headerService } from '../services/header-service.js';

export class Header {
    
    constructor() {
        this.createContent();
        
        headerService.logoSubscribe((logoSrc) => {
            if(logoSrc) {
                this.headerLogo.src = logoSrc;
            }
            
        });

        EventService.addEventListener('change-logo', (logoSrc) => {
            this.headerLogo.src = logoSrc;
        });

        EventService.addEventListener('header-buttons-left', (formButtons) => {
            this.navbarNavLeft.innerHTML = '';
            for (const formButton of formButtons) {
                this.navbarNavLeft.appendChild(this.getNavBarItem(formButton));
            }
        });

        EventService.addEventListener('header-buttons-right', (formButtons) => {
            this.headerUserMenu.innerHTML = '';
            for (const formButton of formButtons) {
                this.headerUserMenu.appendChild(this.getNavBarItem(formButton));
            }
        });
    }

    createContent() {
        this.header = document.createElement('header');
        this.header.className = 'header';
        
        this.logoContainer = document.createElement('div');
        this.logoContainer.className = 'header-logo-container';
        this.header.appendChild(this.logoContainer);

        this.headerLogo = document.createElement('img');
        this.headerLogo.className = 'header-logo';
        this.headerLogo.src = '/includes/images/logo.svg';
        this.headerLogo.onerror = () => {
            console.warn('Failed to load header logo, using default');
            this.headerLogo.src = '/includes/images/logo.svg';
        };
        this.logoContainer.appendChild(this.headerLogo);

        this.navbar = document.createElement('nav');
        this.navbar.className = 'header-navbar';
        this.header.appendChild(this.navbar);


        const homeButton = new FormButton(Lang.get('header.home'), 'header-home', null, () => {
            Router.home();
        });

        const navbarHome = document.createElement('div');
        navbarHome.className = 'header-navbar-home';
        navbarHome.appendChild(homeButton.getContent());
        this.navbar.appendChild(navbarHome);

        const navbarHomeDividerContainer = document.createElement('div');
        navbarHomeDividerContainer.className = 'header-divider-container';
        this.navbar.appendChild(navbarHomeDividerContainer);

        const navbarHomeDivider = document.createElement('div');
        navbarHomeDivider.className = 'icon icon-chevron-right';
        navbarHomeDividerContainer.appendChild(navbarHomeDivider);

        this.navbarNavLeft = document.createElement('ul');
        this.navbarNavLeft.className = 'header-navbar-left ';
        this.navbar.appendChild(this.navbarNavLeft);
        

        this.#createUserMenu();
    }

    #createUserMenu() {
        const userMenuContainer = document.createElement('div');
        userMenuContainer.className = 'header-navbar-right header-user-menu-container';
        this.navbar.appendChild(userMenuContainer);

        const userMenuBtn = document.createElement('button');
        userMenuBtn.setAttribute('aria-haspopup', 'true');
        userMenuBtn.setAttribute('aria-expanded', 'false');
        userMenuBtn.className = 'header-user-menu-btn icon icon-user';
        userMenuContainer.appendChild(userMenuBtn);
        userMenuBtn.addEventListener('click', () => {
            const expanded = userMenuBtn.getAttribute('aria-expanded') === 'true';
            userMenuBtn.setAttribute('aria-expanded', String(!expanded));

            this.#userMenuOpen();
        });

        const userMenuBtnName = document.createElement('span');
        userMenuBtnName.className = 'header-username';
        userMenuBtnName.innerText = Auth.getUser().name;
        userMenuBtn.appendChild(userMenuBtnName);

        const userMenuBtnChevron = document.createElement('span');
        userMenuBtnChevron.className = 'header-icon';
        userMenuBtnChevron.innerHTML = '&#9662;';
        userMenuBtn.appendChild(userMenuBtnChevron);

        this.headerUserMenu = document.createElement('ul');
        this.headerUserMenu.className = 'header-user-menu';
        userMenuContainer.appendChild(this.headerUserMenu);
    }

    #userMenuClickOutside(event) {
        if (!this.headerUserMenu.contains(event.target) && !event.target.closest('.header-user-menu-btn')) {
            this.#userMenuClose();
        }
    }

    #userMenuOpen() {
        const expanded = this.headerUserMenu.classList.contains('active');
        this.headerUserMenu.classList.toggle('active', !expanded);

        setTimeout(() => {
            document.addEventListener('click', this.#userMenuClickOutside.bind(this));
        }, 0);
    }

    #userMenuClose() {
        this.headerUserMenu.classList.remove('active');
        document.removeEventListener('click', this.#userMenuClickOutside.bind(this));
    }

    getNavBarItem(formButton) {
        const navItem = document.createElement('li');
        navItem.className = 'nav-item';

        navItem.appendChild(formButton.getContent());
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
        
        return this.header;
    }
}
