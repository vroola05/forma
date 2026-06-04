INSERT INTO permissions (id) VALUES 
    ('tenant:create:internal'),
    ('tenant:read'),
    ('tenant:read:internal'),
    ('tenant:update'),
    ('tenant:update:internal'),
    ('tenant:delete'),
    ('user:create'),
    ('user:read'),
    ('user:update'),
    ('user:delete'),
    ('group:create'),
    ('group:read'),
    ('group:read:internal'),
    ('group:update'),
    ('group:delete'),
    ('form:create'),
    ('form:read'),
    ('form:update'),
    ('form:delete'),
    ('submission:create'),
    ('submission:read'),
    ('submission:update'),
    ('submission:delete');


INSERT INTO groups (id, tenant_id, name) VALUES 
    ('00000000-0000-0000-0000-000000000001', NULL, 'Global Administrators');

INSERT INTO group_permissions (group_id, permission_id) VALUES 
    ('00000000-0000-0000-0000-000000000001', 'tenant:create:internal'),
    ('00000000-0000-0000-0000-000000000001', 'tenant:read'),
    ('00000000-0000-0000-0000-000000000001', 'tenant:read:internal'),
    ('00000000-0000-0000-0000-000000000001', 'tenant:update'),
    ('00000000-0000-0000-0000-000000000001', 'tenant:update:internal'),
    ('00000000-0000-0000-0000-000000000001', 'tenant:delete'),
    ('00000000-0000-0000-0000-000000000001', 'user:create'),
    ('00000000-0000-0000-0000-000000000001', 'user:read'),
    ('00000000-0000-0000-0000-000000000001', 'user:update'),
    ('00000000-0000-0000-0000-000000000001', 'user:delete'),
    ('00000000-0000-0000-0000-000000000001', 'group:create'),
    ('00000000-0000-0000-0000-000000000001', 'group:read:internal'),
    ('00000000-0000-0000-0000-000000000001', 'group:update'),
    ('00000000-0000-0000-0000-000000000001', 'group:delete');