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

CREATE TABLE company (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    version bigint DEFAULT 0 NOT NULL
);

CREATE TABLE form_definition (
    id UUID PRIMARY KEY,
    company_id UUID REFERENCES company(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    label TEXT NULL,
    classes TEXT NULL,
    metadata TEXT[] NULL,
    summary_confirmation TEXT[] NULL,
    condition JSONB NULL,
    show boolean NOT NULL DEFAULT TRUE,
    version bigint DEFAULT 0 NOT NULL,
    UNIQUE (name, company_id)
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
    version bigint DEFAULT 0 NOT NULL
);

CREATE TABLE form_tab_instance_definition (
    form_id UUID REFERENCES form_definition(id) ON DELETE CASCADE,
    tab_id UUID REFERENCES form_tab_definition(id) ON DELETE CASCADE,
    sort_order INT NOT NULL DEFAULT 0,
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
    version bigint DEFAULT 0 NOT NULL
);

CREATE TABLE form_submission (
    id UUID PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    form_id UUID REFERENCES form_definition(id) ON DELETE NO ACTION,
    form_name TEXT NOT NULL,
    form_version bigint NOT NULL,
    data JSONB NULL,
    version bigint DEFAULT 0 NOT NULL
);

COMMIT;