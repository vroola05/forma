import { Lang } from '../../../../shared/services/lang';
import { RouteExtended, Router } from '../../../../shared/services/router';

export class BuilderPageFormEditorBtns {
    content = document.createElement('div');
    currentPath: Readonly<RouteExtended | null>;

    constructor() {

        this.currentPath = Router.getCurrentRoute();
        this.content.className = 'builder-page-form-editor-btn-container';
        this.createMenuItem('', '', Lang.get('page.settings.generic'));
        this.createMenuItem('', '/settings-form', Lang.get('page.settings.form'));
        this.createMenuItem('', '/settings-login', Lang.get('page.settings.login'));
        this.createMenuItem('', '/settings-success', Lang.get('page.settings.successpage'));
        this.createMenuItem('', '/settings-mail', Lang.get('page.settings.mail'));
        this.createMenuItem('', '/settings-registration', Lang.get('page.settings.registration'));
        this.createMenuItem('', '/settings-payment', Lang.get('page.settings.payment'));
    }

    createMenuItem(icon: string, path: string, label: string) {
        const builderPageFieldItem = document.createElement('button');
        builderPageFieldItem.className = 'builder-page-form-editor-btn'
            + (icon !== '' ? ' icon ' + icon : '')  
            + (this.currentPath && this.currentPath.subPath === path ? ' selected' : '');
        builderPageFieldItem.innerHTML = label;
        builderPageFieldItem.setAttribute('data-path', path);
        builderPageFieldItem.setAttribute('data-label', label);
        builderPageFieldItem.onclick = (e) => {
            const target = e.currentTarget as HTMLElement;

            if (!this.currentPath?.parentPath)
                return;
            
            Router.route(this.currentPath.parentPath + (target.dataset.path ? target.dataset.path : '' ));
        };

        this.content.append(builderPageFieldItem);
    }

    getContent() {
        return this.content;
    }
}