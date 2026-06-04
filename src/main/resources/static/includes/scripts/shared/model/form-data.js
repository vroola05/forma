import { Lang } from '../services/lang.js';

export const PERMISSIONS = Object.freeze({
    TENANT_CREATE_INTERNAL: 'tenant:create:internal',
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

export const USER_STATUS = {
    INVITED: () => Lang.get('generic.status.invited'),
    ACTIVE: () => Lang.get('generic.status.active'),
    BLOCKED: () => Lang.get('generic.status.blocked'),
    PENDING_DELETION: () => Lang.get('generic.status.pending.deletion')
};

export const TENANT_STATUS = {
    ACTIVE: () => Lang.get('generic.status.active'),
    SUSPENDED: () => Lang.get('generic.status.suspended'),
    PENDING_DELETION: () => Lang.get('generic.status.pending.deletion')
};

export const FORM_STATUS = {
    DRAFT: () => Lang.get('generic.status.draft'),
    PUBLISHED: () => Lang.get('generic.status.published'),
    ARCHIVED: () => Lang.get('generic.status.archived'),
    PENDING_DELETION: () => Lang.get('generic.status.pending.deletion')
};

export class Tenant {
    constructor(data = {}) {
        this.id = data.id;
        this.slug = data.slug;
        this.name = data.name;
        this.hasLogo = data.hasLogo;
        this.primaryColor = data.primaryColor;
        this.secondaryColor = data.secondaryColor;
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
        this.email = data.email;
        this.status = data.status;
        this.groups = data.groups;
    }

}

export class UserRegisterRequest {
    constructor(data = {}) {
        this.id = data.id;
        this.name = data.name;
        this.username = data.username;
        this.password = data.password;
        this.email = data.email;
        this.status = data.status;
        this.groups = data.groups;
    }
}

export class GroupRegisterRequest {
    constructor(data = {}) {
        this.id = data.id;
        this.name = data.name;
        this.permissions = data.permissions;
    }
}

export class FormWrapper {
    constructor(data = {}) {
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
        this.status = data.status;
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