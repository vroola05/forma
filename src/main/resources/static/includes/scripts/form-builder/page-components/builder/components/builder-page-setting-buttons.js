import { Lang } from '../../../../shared/services/lang.js';
import { Router } from '../../../../shared/services/router.js';

export class BuilderPageSettingButtons {
    content = document.createElement('div');
    

    /*
    Form
        - builder
    Generic settings
        - stylesheet
    Login settings
        - ldap
        - username password
        - digid
        - eherkenning
    Confirmation mail
        - Send email
        - Email tekst
        - Send pdf
    Text successpage
    Registration
    Payment
    */
    constructor() {
        // const parts = Router.parts;
        // if (parts && parts.child) {
        //     this.subPath = parts.child;
        // }

        this.currentPath = Router.getCurrentRoute();
        this.content.className = 'builder-page-settings-container';

        this.createBlaItem('', '', Lang.get('page.settings.form'));
        this.createBlaItem('', '/settings-generic', Lang.get('page.settings.generic'));
        this.createBlaItem('', '/settings-login', Lang.get('page.settings.login'));
        this.createBlaItem('', '/settings-success', Lang.get('page.settings.successpage'));
        this.createBlaItem('', '/settings-mail', Lang.get('page.settings.mail'));
        this.createBlaItem('', '/settings-registration', Lang.get('page.settings.registration'));
        this.createBlaItem('', '/settings-payment', Lang.get('page.settings.payment'));
    }

    createBlaItem(icon, path, label) {
        const builderPageFieldItem = document.createElement('button');
        builderPageFieldItem.className = 'builder-page-settings-button'
            + (icon !== '' ? ' icon ' + icon : '')  
            + (this.currentPath && this.currentPath.subPath === path ? ' selected' : '');
        builderPageFieldItem.innerHTML = label;
        builderPageFieldItem.setAttribute('data-path', path);
        builderPageFieldItem.setAttribute('data-label', label);
        builderPageFieldItem.onclick = (e) => {
            Router.route(this.currentPath.parentPath + e.currentTarget.dataset.path);
        };

        this.content.append(builderPageFieldItem);
    }

    getContent() {
        return this.content;
    }
}