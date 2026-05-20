BEGIN;

---------------------
---------------------
-- ALLE TYPEN DEFINITIES
---------------------
---------------------

CREATE TABLE form_container_definition_type (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL
);

---------------------
---------------------
-- ALLE DEFINITIE TABELLEN
---------------------
---------------------

CREATE TABLE tenant (
    id UUID PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    logo TEXT NULL,
    home_page TEXT NULL,
    
    active BOOLEAN DEFAULT true NOT NULL,
    email TEXT NOT NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    version BIGINT DEFAULT 0 NOT NULL
);

CREATE TABLE users (
    id UUID PRIMARY KEY,
    tenant_id UUID REFERENCES tenant(id),
    name TEXT NOT NULL,
    username TEXT NOT NULL,
    password TEXT NOT NULL,
    email TEXT NOT NULL,
    role TEXT NOT NULL,
    auth_provider TEXT DEFAULT 'LOCAL',
    external_id TEXT NULL,
    active BOOLEAN DEFAULT true NOT NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    version BIGINT DEFAULT 0 NOT NULL
);

CREATE TABLE tenant_groups (
    id UUID PRIMARY KEY,
    tenant_id UUID REFERENCES tenant(id),
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    version BIGINT DEFAULT 0 NOT NULL
);

CREATE TABLE permissions (
    id TEXT PRIMARY KEY
);

CREATE TABLE group_permissions (
    group_id UUID REFERENCES tenant_groups(id),
    permission_id TEXT REFERENCES permissions(id),
    PRIMARY KEY (group_id, permission_id)
);

CREATE TABLE user_groups (
    user_id UUID REFERENCES users(id),
    group_id UUID REFERENCES tenant_groups(id),
    PRIMARY KEY (user_id, group_id)
);


CREATE TABLE form_definition (
    id UUID PRIMARY KEY,
    tenant_id UUID REFERENCES tenant(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    label TEXT NULL,
    classes TEXT NULL,
    metadata TEXT[] NULL,
    summary_confirmation TEXT[] NULL,
    condition JSONB NULL,
    show boolean NOT NULL DEFAULT TRUE,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    version BIGINT DEFAULT 0 NOT NULL,
    UNIQUE (name, tenant_id)
);

CREATE TABLE form_tab_definition (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    label TEXT NULL,
    classes TEXT NULL,
    shared_tab BOOLEAN NOT NULL DEFAULT FALSE,
    metadata TEXT[] NULL,
    condition JSONB NULL,
    show boolean NOT NULL DEFAULT TRUE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    version BIGINT DEFAULT 0 NOT NULL
);

CREATE TABLE form_tab_instance_definition (
    form_id UUID REFERENCES form_definition(id) ON DELETE CASCADE,
    tab_id UUID REFERENCES form_tab_definition(id) ON DELETE CASCADE,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    version BIGINT DEFAULT 0 NOT NULL,
    PRIMARY KEY (form_id, tab_id)
);


CREATE TABLE form_field_definition (
    id UUID PRIMARY KEY,
    tab_id UUID REFERENCES form_tab_definition(id) ON DELETE CASCADE,
    parent_field_id UUID REFERENCES form_field_definition(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    label TEXT NULL,
    type TEXT NOT NULL,
    classes TEXT NULL,
    placeholder TEXT NULL,
    metadata TEXT[] NULL,
    readonly boolean NULL,
    required boolean NULL,
    min_length INT NULL,
    max_length INT NULL,
    show boolean NOT NULL DEFAULT TRUE,
    sort_order INT NOT NULL DEFAULT 0,
    condition JSONB NULL,
    options JSONB NULL,
    value TEXT NULL,
    values JSONB NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    version BIGINT DEFAULT 0 NOT NULL
);

CREATE TABLE form_config_success_page (
    id UUID PRIMARY KEY REFERENCES form_definition(id) ON DELETE CASCADE,
    template_name TEXT NULL,
    template_title TEXT NULL,
    template JSONB NULL,
    show_summary  BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    version BIGINT DEFAULT 0 NOT NULL
);


CREATE TABLE form_submission (
    id UUID PRIMARY KEY,
    tenant_id UUID REFERENCES tenant(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    form_id UUID REFERENCES form_definition(id) ON DELETE NO ACTION,
    form_name TEXT NOT NULL,
    form_version bigint NOT NULL,
    data JSONB NULL,
    version BIGINT DEFAULT 0 NOT NULL
);

CREATE INDEX idx_tenant_slug ON tenant(slug);

COMMIT;