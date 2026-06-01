export const PERMISSIONS = Object.freeze({
    TENANT_CREATE: 'tenant:create',
    TENANT_READ: 'tenant:read',
    TENANT_READ_INTERNAL: 'tenant:read:internal',
    TENANT_UPDATE: 'tenant:update',
    TENANT_UPDATE_INTERNAL: 'tenant:update:internal',
    TENANT_DELETE: 'tenant:delete',

    USER_CREATE: 'user:create',
    USER_READ: 'user:read',
    USER_UPDATE: 'user:update',
    USER_DELETE: 'user:delete',

    GROUP_CREATE: 'group:create',
    GROUP_READ: 'group:read',
    GROUP_UPDATE: 'group:update',
    GROUP_DELETE: 'group:delete',

    FORM_CREATE: 'form:create',
    FORM_READ: 'form:read',
    FORM_UPDATE: 'form:update',
    FORM_DELETE: 'form:delete',

    SUBMISSION_CREATE: 'submission:create',
    SUBMISSION_READ: 'submission:read',
    SUBMISSION_UPDATE: 'submission:update',
    SUBMISSION_DELETE: 'submission:delete'
});


export class Tenant {
    constructor(data = {}) {
        this.id = data.id;
        this.slug = data.slug;
        this.name = data.name;
        this.logo = data.logo;
        this.homePage = data.homePage;
        this.email = data.email;
        this.status = data.status;
    }

    setTenantAdmin(user) {
        this.tenantAdmin = user;
    }
}

export class User {
    constructor(data = {}) {
        this.name = data.name;
        this.username = data.username;
        this.password = data.password;
        this.email = data.email;
        this.status = data.status;
    }

    setAdminUser() {
        
    }
}

export class FormWrapper {
    constructor(data = {}) {
        this.status = data.status;
        this.fileName = data.fileName;
        this.formConfig = new FormConfig(data.formConfig);
        this.form = new Form(data.form);
    }
}

export class Form {
    constructor (data = {}) {
        this.id = data.id;
        this.name = data.name;
        this.label = data.label;
        this.classes = data.classes;
        this.metadata = data.metadata;
        this.confirmation = data.confirmation;
        this.confirmationCheck = data.confirmationCheck;
        this.fields = data.fields;
        this.type = data.type;
        this.condition = data.condition;
        this.show = data.show;
    }
}

export class FormConfig {
    constructor (data = {}) {
        this.formConfigSuccessPage = new FormConfigSuccessPage(data.formConfigSuccessPage);
    }
}

export class FormConfigSuccessPage {
    constructor (data = {}) {
        this.id = data.id;
        this.name = data.name;
        this.title = data.title;
        this.template = data.template;
        this.content = data.content;
        this.showSummary = data.showSummary;
    }
}

export class FormSubmission {
    constructor (data = {}) {
        this.submissionId = data.submissionId;
    }
}