BEGIN;


CREATE TABLE form_config_success_page (
    id UUID PRIMARY KEY REFERENCES form_definition(id) ON DELETE CASCADE,
    template_name TEXT NULL,
    template_title TEXT NULL,
    template JSONB NULL,
    show_summary  BOOLEAN NOT NULL DEFAULT FALSE
);

COMMIT;