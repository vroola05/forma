import { Page } from '../../../shared/page-components/page';
import { Http } from '../../../shared/services/http';
import { Router } from '../../../shared/services/router';
import { Lang } from '../../../shared/services/lang';
import { Auth } from '../../../shared/services/auth';
import { TextField } from '../../../shared/form-components/text-field';
import { PasswordField } from '../../../shared/form-components/password-field';
import { FormButton } from '../../../shared/form-components/components/form-button';
import { TenantService } from '../../../shared/services/tenant-service';
import { Loader } from '../../../shared/services/loader';

export class LoginPage extends Page {
    loginErrorContainer = document.createElement('div');

    usernameField: TextField;
    passwordField: PasswordField;

    constructor() {
        super();
        
        this.usernameField = new TextField('username', Lang.get('login.username'))
                .setLayout('layout-column');
        this.passwordField = new PasswordField('password', Lang.get('login.password'))
                .setLayout('layout-column');

        this.setTitle(Lang.get('login.title'));
        
        this.createContent();
    }

    createContent() {
        this.content = document.createElement('div');
        this.content.classList.add('login-page-content-container');

        const loginPageContent = document.createElement('div');
        loginPageContent.className = 'login-page-content';
        this.content.appendChild(loginPageContent);

        const loginWelcomeContainer = document.createElement('div');
        loginWelcomeContainer.className = 'login-welcome-container';
        
        const loginWelcomeInnerContainer = document.createElement('div');
        loginWelcomeInnerContainer.className = 'login-welcome-inner-container';
        loginWelcomeContainer.appendChild(loginWelcomeInnerContainer);

        const loginWelcomeHeader = document.createElement('h1');
        loginWelcomeHeader.className = 'login-header';
        loginWelcomeHeader.innerHTML = Lang.get('login.header');
        loginWelcomeInnerContainer.appendChild(loginWelcomeHeader);

        const loginWelcomeText = document.createElement('div');
        loginWelcomeText.className = 'login-header-text';
        loginWelcomeText.innerHTML = Lang.get('login.text');
        loginWelcomeInnerContainer.appendChild(loginWelcomeText);

        const loginLogoContainer = document.createElement('div');
        loginLogoContainer.className = 'login-logo-container';
        loginWelcomeInnerContainer.appendChild(loginLogoContainer);

        const loginLogo = document.createElement('img');
        loginLogo.className = 'login-logo';
        if (Router.tenantSlug && TenantService?.tenant?.hasLogo && Router.tenantSlug !== 'system') {
            loginLogo.src = `${Router.tenantPath}/api/tenant/logo`;
        } else {
            loginLogo.src = '/logo.svg';
        }

        loginLogoContainer.appendChild(loginLogo);
        
        const loginContentContainer = document.createElement('div');
        loginContentContainer.className = 'login-content-container';

        loginPageContent.append(loginWelcomeContainer, loginContentContainer);

        const button = new FormButton(
            Lang.get('login.submit'), 'login-button btn-primary', undefined, () => {
                Loader.show();
                Http.post(`${Router.tenantPath}/api/login`, 
                    new URLSearchParams({
                        username: this.usernameField.getValue(),
                        password: this.passwordField.getValue()
                    }),
                    {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                )
                .then(() => {
                    Loader.hide();
                    Http.get(`${Router.tenantPath}/api/users/me`).then(user => {
                        Auth.setUser(user);
                        Router.home();
                    })
                    .catch(() => {});
                    
                })
                .catch((error) => {
                    Loader.hide();
                    this.loginErrorContainer.innerText = error?.message;
                });
                
            }
        )
        
        this.loginErrorContainer.className = 'login-error-container';

        loginContentContainer.append(
            this.usernameField.getContent(),
            this.passwordField.getContent(),
            button.getContent(),
            this.loginErrorContainer);
    }

    afterInit() {

    }
}
