package org.commonground.forma.model.settings.constants;

import org.springframework.stereotype.Component;

@Component("Permissions")
public class Permissions {
    public static final String FORM_CREATE = "form:create";
    public static final String FORM_READ = "form:read";
    public static final String FORM_UPDATE = "form:update";
    public static final String FORM_DELETE = "form:delete";
    public static final String FORM_FILL = "form:fill";
    public static final String FORM_SUBMIT = "form:submit";

    public static final String GROUP_CREATE = "group:create";
    public static final String GROUP_READ = "group:read";
    public static final String GROUP_READ_INTERNAL = "group:read:internal";
    public static final String GROUP_UPDATE = "group:update";
    public static final String GROUP_DELETE = "group:delete";

    public static final String LOGIN_MANAGEMENT_CREATE = "login.management:create";
    public static final String LOGIN_MANAGEMENT_READ = "login.management:read";
    public static final String LOGIN_MANAGEMENT_UPDATE = "login.management:update";
    public static final String LOGIN_MANAGEMENT_DELETE = "login.management:delete";

    public static final String SUBMISSION_CREATE = "submission:create";
    public static final String SUBMISSION_READ = "submission:read";
    public static final String SUBMISSION_UPDATE = "submission:update";
    public static final String SUBMISSION_DELETE = "submission:delete";

    public static final String TENANT_CREATE_INTERNAL = "tenant:create:internal";
    public static final String TENANT_READ = "tenant:read";
    public static final String TENANT_READ_INTERNAL = "tenant:read:internal";
    public static final String TENANT_UPDATE = "tenant:update";
    public static final String TENANT_UPDATE_INTERNAL = "tenant:update:internal";
    public static final String TENANT_DELETE = "tenant:delete";
    
    public static final String USER_CREATE = "user:create";
    public static final String USER_READ = "user:read";
    public static final String USER_UPDATE = "user:update";
    public static final String USER_DELETE = "user:delete";

}
