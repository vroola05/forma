export class Tenant {
    constructor(data = {}) {
        this.id = data.id;
        this.slug = data.slug;
        this.name = data.name;
        this.logo = data.logo;
        this.homePage = data.homePage;
        this.email = data.email;
        this.active = data.active;
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
        this.active = data.active;
    }

    setAdminUser() {
        
    }
}

export class FormWrapper {
    constructor(data = {}) {
        this.active = data.active;
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