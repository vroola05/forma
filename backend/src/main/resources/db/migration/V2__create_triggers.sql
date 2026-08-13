CREATE OR REPLACE FUNCTION delete_orphan_tabs()
RETURNS TRIGGER AS $$
BEGIN
    -- Controleer of er nog andere formulieren zijn die deze tab gebruiken
    IF NOT EXISTS (SELECT 1 FROM form_tab_instance_definition WHERE tab_id = OLD.tab_id) THEN
        DELETE FROM form_tab_definition WHERE id = OLD.tab_id;
    END IF;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_delete_orphan_tabs
AFTER DELETE ON form_tab_instance_definition
FOR EACH ROW
EXECUTE FUNCTION delete_orphan_tabs();