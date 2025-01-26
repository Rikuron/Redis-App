// Defines roles for Role-Based Access Control (RBAC)

export const roles = {
    ADMIN: 'admin',
    EDITOR: 'editor',
    VIEWER: 'viewer',
};

export const permissions = {
    [roles.ADMIN]: ['add', 'edit', 'delete', 'view'],
    [roles.EDITOR]: ['edit', 'view'],
    [roles.VIEWER]: ['view'],
};