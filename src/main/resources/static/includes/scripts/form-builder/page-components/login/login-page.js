import { Page } from '../../../shared/page-components/page.js';
import { Http } from '../../../shared/services/http.js';
import { Router } from '../../../shared/services/router.js';
import { Lang } from '../../../shared/services/lang.js';
import { Auth } from '../../../shared/services/auth.js';
import { TextField } from '../../../shared/form-components/text-field.js';
import { PasswordField } from '../../../shared/form-components/password-field.js';
import { FormButton } from '../../../shared/form-components/components/form-button.js';

export class LoginPage extends Page {

    loader = document.querySelector('.loader');

    constructor() {
        super();
        
        this.setTitle(Lang.get('login.title'));
        
        this.createContent();
        console.log('a');
    }

    createContent() {
        this.content = document.createElement('div');
        this.content.className = 'login-container';

        const loginInnerContainer = document.createElement('div');
        loginInnerContainer.className = 'login-inner-container';
        this.content.appendChild(loginInnerContainer);

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
        loginLogo.src = 'includes/images/logo.svg';
        loginLogoContainer.appendChild(loginLogo);
        
        const loginContentContainer = document.createElement('div');
        loginContentContainer.className = 'login-content-container';

        loginInnerContainer.append(loginWelcomeContainer, loginContentContainer);

        this.usernameField = new TextField('username', Lang.get('login.username'));

        this.usernameField.setLayout('layout-column');
        this.passwordField = new PasswordField('password', Lang.get('login.password'));
        this.passwordField.setLayout('layout-column');

        const button = new FormButton(
            Lang.get('login.submit'), 'login-button btn-primary', undefined, () => {
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
                    Http.get(`${Router.tenantPath}/api/users/me`).then(user => {
                        Auth.setUser(user);
                        Router.home();
                    })
                    .catch(() => {});
                    
                })
                .catch((error) => {
                    this.loginErrorContainer.innerText = error?.message;
                });
                
            }
        )
        this.loginErrorContainer = document.createElement('div');
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
