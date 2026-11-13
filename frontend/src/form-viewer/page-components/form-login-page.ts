import { Page } from '../../shared/page-components/page';
import { Router } from '../../shared/services/router';

import { FormButton } from '../../shared/form-components/components/form-button';
import { Form } from '../../shared/form-components/form';
import { PasswordField } from '../../shared/form-components/password-field';
import { TextField } from '../../shared/form-components/text-field';
import { Footer } from '../../shared/generic-components/footer';
import { Header } from '../../shared/generic-components/header';
import { ExternalIdpDto, FormAuthenticationDto, FormWrapper } from '../../shared/model/types';
import { Auth } from '../../shared/services/auth';
import { ApiError, Http } from '../../shared/services/http';
import { Lang } from '../../shared/services/lang';
import { Loader } from '../../shared/services/loader';
import { PurifyService } from '../../shared/services/purify-service';
import { TenantService } from '../../shared/services/tenant-service';
import { ToastService } from '../../shared/services/toast-service';

export class FormLoginPage extends Page {
    content = document.createElement('div');
    pageContentContainer = document.createElement('div');
    pageTitle = document.createElement('h1');
    formContainer = document.createElement('div');

    formLogin = document.createElement('div');
    formLoginDescription = document.createElement('div');
    formLoginMethodContainer = document.createElement('div');

    usernameField: TextField;
    passwordField: PasswordField;

    header: Header = new Header();
    footer: Footer = new Footer();

    formName: string = ''
    projectName: string = '';

    formWrapper: FormWrapper | undefined = undefined;
    form: Form | undefined;

    constructor() {
        super();

        this.usernameField = new TextField('username').setLabel(Lang.get('login.username'));
        this.passwordField = new PasswordField('password').setLabel(Lang.get('login.password'));

        const formNameUrlParam = Router.getUrlParameter('formName');
        if (formNameUrlParam) {
            this.formName = formNameUrlParam;

            this.setPageParameters({ 
                formName: this.formName,
                clientSessionId: this.parameters?.clientSessionId ? this.parameters.clientSessionId : crypto.randomUUID()
            });
            this.createContent();

        }
    }

    getContent() {
        const fragment = document.createDocumentFragment();
        fragment.append(
            this.header.getContent(),
            this.content,
            this.footer.getContent());

        return fragment;
    }

    createContent() {
        this.content.className = 'page-wrapper';

        this.pageTitle.className = 'page-title';
        this.pageTitle.innerHTML = '';
        this.content.append(this.pageTitle);

        this.pageContentContainer.id = 'page-content-container';
        this.pageContentContainer.className = 'page-content-container';
        this.content.append(this.pageContentContainer);

        this.formContainer.className = 'form-container';
        this.pageContentContainer.appendChild(this.formContainer);

        this.formLogin.className = 'form-login';
        this.formContainer.appendChild(this.formLogin);
        
        this.formLoginDescription.className = 'form-login-description';
        this.formLogin.appendChild(this.formLoginDescription);

        this.formLoginMethodContainer.className = 'form-login-method-container';
        this.formLogin.appendChild(this.formLoginMethodContainer);
        
        
    }

    afterInit() {
        this.getForm(this.formName);
    }

    setTitle(title: string) {
        this.title = title;

        const titleDom = document.createElement('span');
        titleDom.innerHTML = title;

        this.pageTitle.innerHTML = '';
        this.pageTitle.appendChild(titleDom);
        document.title = title;
    }

    getForm(formName: string) {
        Loader.show();

        Http.get(`${Router.tenantPath}/api/forms/${formName}/auth-metadata`, {})
            .then((formAuthentication: FormAuthenticationDto) => {
                Loader.hide();
                
                this.setTitle(Lang.getTranslation(formAuthentication.label));

                if (!formAuthentication.allowFormLogin && (!formAuthentication.externalProviders || formAuthentication.externalProviders.length === 0)) {
                    Router.route(`${Router.tenantPath}/page/form/${formName}`);
                }

                this.formLoginDescription.innerHTML  = PurifyService.renderSafeHtml(formAuthentication.description);

                if (formAuthentication.allowFormLogin) {
                    this.formLoginMethodContainer.appendChild(this.createLogin(formName));
                }

                if (formAuthentication.publicAccess) {
                    
                    this.formLoginMethodContainer.appendChild(this.createExternalLoginType({
                        displayName: Lang.get('login.default.method.none.title'),
                        information: Lang.get('login.default.method.none.information'),
                        id: '',
                        loginUrl: Router.tenantPath + `/page/form/${formName}`,
                        linkText: 'Verder',
                        providerType: ''
                    }));

                }
                
            })
            .catch(error => {
                Loader.hide();
                if (error instanceof ApiError) {
                    ToastService.error(Lang.get('error.check.fields'));
                }
            });
    }


    createLogin(formName: string) {
        const authMethodContainer = document.createElement('div');
        authMethodContainer.classList.add('auth-method-container');

        const authMethod = document.createElement('div');
        authMethod.className = 'auth-method';
        authMethodContainer.appendChild(authMethod);

        const authMethodHeader = document.createElement('div');
        authMethodHeader.className = 'auth-method-header';
        authMethodHeader.innerHTML = Lang.get('login.default.method.form.login.title');
        authMethod.appendChild(authMethodHeader);

        const authMethodInformation = document.createElement('div');
        authMethodInformation.className = 'auth-method-information';
        authMethodInformation.innerHTML = Lang.get('login.default.method.form.login.information');
        authMethod.appendChild(authMethodInformation);

        const authMethodLogoContainer = document.createElement('div');
        authMethodLogoContainer.className = 'auth-method-logo-container';
        authMethod.appendChild(authMethodLogoContainer);

        const authMethodLogo = document.createElement('img');
        authMethodLogo.className = 'auth-method-logo';
        if (Router.tenantSlug && TenantService?.tenant?.hasLogo && Router.tenantSlug !== 'system') {
            authMethodLogo.src = `${Router.tenantPath}/api/tenant/logo`;
        } else {
            authMethodLogo.src = '/logo.svg';
        }

        authMethodLogoContainer.appendChild(authMethodLogo);
        
        const authMethodInputContainer = document.createElement('div');
        authMethodInputContainer.className = 'auth-method-input-container';
        authMethodInputContainer.append(
            this.usernameField.getContent(),
            this.passwordField.getContent());

        authMethod.append(authMethodInputContainer);

        const submitBtn = new FormButton(
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
                        Router.route(Router.tenantPath + `/page/form/${formName}`);
                    })
                    .catch(() => {});
                    
                })
                .catch((error) => {
                    Loader.hide();
                    
                });
                
            }
        );
        
        const authMethodBtnContainer = document.createElement('div');
        authMethodBtnContainer.className = 'auth-method-btn-container';
        authMethodBtnContainer.append(submitBtn.getContent());

        authMethod.append(authMethodBtnContainer);
        
        return authMethodContainer;
    }

    createExternalLoginType(externalIdpDto: ExternalIdpDto) {
        const authMethodContainer = document.createElement('div');
        authMethodContainer.classList.add('auth-method-container');

        const authMethod = document.createElement('div');
        authMethod.className = 'auth-method';
        authMethodContainer.appendChild(authMethod);

        const authMethodHeader = document.createElement('div');
        authMethodHeader.className = 'auth-method-header';
        authMethodHeader.innerHTML = externalIdpDto.displayName;
        authMethod.appendChild(authMethodHeader);

        const authMethodInformation = document.createElement('div');
        authMethodInformation.className = 'auth-method-information';
        authMethodInformation.innerHTML = externalIdpDto.information;
        authMethod.appendChild(authMethodInformation);

        const authMethodLogoContainer = document.createElement('div');
        authMethodLogoContainer.className = 'auth-method-logo-container';
        authMethod.appendChild(authMethodLogoContainer);

        const btnText = externalIdpDto.linkText ? externalIdpDto.linkText : Lang.get('login.submit');
        const submitBtn = new FormButton(
            btnText, 'login-button btn-primary', undefined, () => {
                Router.route(externalIdpDto.loginUrl);
            });

        const authMethodBtnContainer = document.createElement('div');
        authMethodBtnContainer.className = 'auth-method-btn-container';
        authMethodBtnContainer.append(submitBtn.getContent());

        authMethod.append(authMethodBtnContainer);
        
        return authMethodContainer;
        
        

    }
}
