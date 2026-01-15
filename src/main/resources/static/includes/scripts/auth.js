export class Auth {
    static user = null;
    static roles = new Map();

    constructor() {
    }

    static setUser(user) {
        Auth.user = user;
        // TODO: Get roles from user
        if (user.roles) {
            for(const role of user.roles) {
                Auth.roles.set(role, role);
            }
        }
    }

    static getGroup () {
        return '';
    }

    static hasRole(role) {
        return Auth.roles.has(role);
    }

    static inRoles(rolesArray) {
        if (rolesArray) {
            for (const role of rolesArray) {
                if (Auth.roles.has(role)) {
                    return true;
                }
            }
        }
        return false;
    }
}
