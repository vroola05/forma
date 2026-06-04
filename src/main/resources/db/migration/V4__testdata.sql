

-- Data for Name: tenant; Type: TABLE DATA; Schema: public; Owner: forma
--

ALTER TABLE public.tenant DISABLE TRIGGER ALL;

INSERT INTO public.tenant (id, slug, name, logo, home_page, email, primary_color, secondary_color, status, created_at, updated_at, version) VALUES ('d640827b-026d-4fbd-a6ff-014f0a6d686d', 'kip', 'Kip', 'tenants/d640827b-026d-4fbd-a6ff-014f0a6d686d/assets/logo.png', '', 'test@testing.net', '#931a1a', '#c38e32', 'ACTIVE', '2026-06-02 12:34:42.555185+00', '2026-06-02 12:40:45.808584+00', 0);


ALTER TABLE public.tenant ENABLE TRIGGER ALL;

--
-- Data for Name: form_definition; Type: TABLE DATA; Schema: public; Owner: forma
--

ALTER TABLE public.form_definition DISABLE TRIGGER ALL;



ALTER TABLE public.form_definition ENABLE TRIGGER ALL;

--
-- Data for Name: form_config_success_page; Type: TABLE DATA; Schema: public; Owner: forma
--

ALTER TABLE public.form_config_success_page DISABLE TRIGGER ALL;



ALTER TABLE public.form_config_success_page ENABLE TRIGGER ALL;

--
-- Data for Name: form_container_definition_type; Type: TABLE DATA; Schema: public; Owner: forma
--

ALTER TABLE public.form_container_definition_type DISABLE TRIGGER ALL;



ALTER TABLE public.form_container_definition_type ENABLE TRIGGER ALL;

--
-- Data for Name: form_tab_definition; Type: TABLE DATA; Schema: public; Owner: forma
--

ALTER TABLE public.form_tab_definition DISABLE TRIGGER ALL;



ALTER TABLE public.form_tab_definition ENABLE TRIGGER ALL;

--
-- Data for Name: form_field_definition; Type: TABLE DATA; Schema: public; Owner: forma
--

ALTER TABLE public.form_field_definition DISABLE TRIGGER ALL;



ALTER TABLE public.form_field_definition ENABLE TRIGGER ALL;

--
-- Data for Name: form_submission; Type: TABLE DATA; Schema: public; Owner: forma
--

ALTER TABLE public.form_submission DISABLE TRIGGER ALL;



ALTER TABLE public.form_submission ENABLE TRIGGER ALL;

--
-- Data for Name: form_tab_instance_definition; Type: TABLE DATA; Schema: public; Owner: forma
--

ALTER TABLE public.form_tab_instance_definition DISABLE TRIGGER ALL;



ALTER TABLE public.form_tab_instance_definition ENABLE TRIGGER ALL;

--
-- Data for Name: groups; Type: TABLE DATA; Schema: public; Owner: forma
--

ALTER TABLE public.groups DISABLE TRIGGER ALL;


INSERT INTO public.groups (id, tenant_id, name, created_at, updated_at, version) VALUES ('6f9bb5cd-730d-4a9d-ad2c-8790cb4b7b8e', 'd640827b-026d-4fbd-a6ff-014f0a6d686d', 'Administrators', '2026-06-02 12:34:42.602483+00', '2026-06-02 12:34:42.602483+00', 0);


ALTER TABLE public.groups ENABLE TRIGGER ALL;

--
-- Data for Name: permissions; Type: TABLE DATA; Schema: public; Owner: forma
--

--
-- Data for Name: group_permissions; Type: TABLE DATA; Schema: public; Owner: forma
--

ALTER TABLE public.group_permissions DISABLE TRIGGER ALL;



INSERT INTO public.group_permissions (group_id, permission_id) VALUES ('6f9bb5cd-730d-4a9d-ad2c-8790cb4b7b8e', 'tenant:read');
INSERT INTO public.group_permissions (group_id, permission_id) VALUES ('6f9bb5cd-730d-4a9d-ad2c-8790cb4b7b8e', 'tenant:update');

INSERT INTO public.group_permissions (group_id, permission_id) VALUES ('6f9bb5cd-730d-4a9d-ad2c-8790cb4b7b8e', 'group:create');
INSERT INTO public.group_permissions (group_id, permission_id) VALUES ('6f9bb5cd-730d-4a9d-ad2c-8790cb4b7b8e', 'group:delete');
INSERT INTO public.group_permissions (group_id, permission_id) VALUES ('6f9bb5cd-730d-4a9d-ad2c-8790cb4b7b8e', 'group:read');
INSERT INTO public.group_permissions (group_id, permission_id) VALUES ('6f9bb5cd-730d-4a9d-ad2c-8790cb4b7b8e', 'group:update');

INSERT INTO public.group_permissions (group_id, permission_id) VALUES ('6f9bb5cd-730d-4a9d-ad2c-8790cb4b7b8e', 'user:create');
INSERT INTO public.group_permissions (group_id, permission_id) VALUES ('6f9bb5cd-730d-4a9d-ad2c-8790cb4b7b8e', 'user:delete');
INSERT INTO public.group_permissions (group_id, permission_id) VALUES ('6f9bb5cd-730d-4a9d-ad2c-8790cb4b7b8e', 'user:read');
INSERT INTO public.group_permissions (group_id, permission_id) VALUES ('6f9bb5cd-730d-4a9d-ad2c-8790cb4b7b8e', 'user:update');

INSERT INTO public.group_permissions (group_id, permission_id) VALUES ('6f9bb5cd-730d-4a9d-ad2c-8790cb4b7b8e', 'submission:create');
INSERT INTO public.group_permissions (group_id, permission_id) VALUES ('6f9bb5cd-730d-4a9d-ad2c-8790cb4b7b8e', 'submission:delete');
INSERT INTO public.group_permissions (group_id, permission_id) VALUES ('6f9bb5cd-730d-4a9d-ad2c-8790cb4b7b8e', 'submission:read');
INSERT INTO public.group_permissions (group_id, permission_id) VALUES ('6f9bb5cd-730d-4a9d-ad2c-8790cb4b7b8e', 'submission:update');

INSERT INTO public.group_permissions (group_id, permission_id) VALUES ('6f9bb5cd-730d-4a9d-ad2c-8790cb4b7b8e', 'form:create');
INSERT INTO public.group_permissions (group_id, permission_id) VALUES ('6f9bb5cd-730d-4a9d-ad2c-8790cb4b7b8e', 'form:delete');
INSERT INTO public.group_permissions (group_id, permission_id) VALUES ('6f9bb5cd-730d-4a9d-ad2c-8790cb4b7b8e', 'form:read');
INSERT INTO public.group_permissions (group_id, permission_id) VALUES ('6f9bb5cd-730d-4a9d-ad2c-8790cb4b7b8e', 'form:update');
;





ALTER TABLE public.group_permissions ENABLE TRIGGER ALL;

--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: forma
--

ALTER TABLE public.users DISABLE TRIGGER ALL;

INSERT INTO public.users (id, tenant_id, name, username, password, email, auth_provider, external_id, status, created_at, updated_at, version) VALUES ('d525ed43-0326-4eef-bfa1-1b4ea2c6bb05', NULL, 'Global Admin', 'admin', '$argon2id$v=19$m=16384,t=2,p=1$Y8GgCab6mz/UbI5dczCMqQ$ruvq6g/0ggIkKChMwDy6V1OTInBMoiG1jlPqhoNKeC0', 'admin@admin.com', NULL, NULL, 'ACTIVE', '2026-06-02 12:29:43.232205+00', '2026-06-02 12:29:43.232205+00', 0);
INSERT INTO public.users (id, tenant_id, name, username, password, email, auth_provider, external_id, status, created_at, updated_at, version) VALUES ('f30aec0c-361a-4481-bab5-1ca3b89f965c', 'd640827b-026d-4fbd-a6ff-014f0a6d686d', 'Mark', 'admin', '$argon2id$v=19$m=16384,t=2,p=1$tUXblJ85VkXsigO/Jawb2g$WP/yswDMDzlxglKmCP0YZHvNC3jPIqo2e6IRGdBLPLI', 'test@testing.net', NULL, NULL, 'INVITED', '2026-06-02 12:34:42.718312+00', '2026-06-02 12:34:42.718312+00', 0);


ALTER TABLE public.users ENABLE TRIGGER ALL;

--
-- Data for Name: user_groups; Type: TABLE DATA; Schema: public; Owner: forma
--

ALTER TABLE public.user_groups DISABLE TRIGGER ALL;

INSERT INTO public.user_groups (user_id, group_id) VALUES ('d525ed43-0326-4eef-bfa1-1b4ea2c6bb05', '00000000-0000-0000-0000-000000000001');
INSERT INTO public.user_groups (user_id, group_id) VALUES ('f30aec0c-361a-4481-bab5-1ca3b89f965c', '6f9bb5cd-730d-4a9d-ad2c-8790cb4b7b8e');


ALTER TABLE public.user_groups ENABLE TRIGGER ALL;

--
-- PostgreSQL database dump complete
--
