package org.commonground.formbuilder;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.fail;

import java.util.List;

import org.commonground.formbuilder.model.FormWrapper;
import org.commonground.formbuilder.model.form.Field;
import org.commonground.formbuilder.model.form.condition.JsonPathFinder;
import org.commonground.formbuilder.model.form.condition.ConditionParser;
import org.commonground.formbuilder.model.form.condition.JsonPathTokenizer;
import org.commonground.formbuilder.services.FormServiceLocal;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import com.fasterxml.jackson.core.JsonProcessingException;


@SpringBootTest
public class JsonPathTokenizerTest {
    @Autowired
    private FormServiceLocal fileStorageService;


    @Test
    public void testStorageServiceTest() {
       
        
        
        try {
            JsonPathTokenizer.tokenize("$.unit-test-form.tab-1.naw.voornaam".toCharArray());
            JsonPathTokenizer.tokenize("$.unit-test-form.tab-1[0:234].naw.voornaam".toCharArray());
            JsonPathTokenizer.tokenize("$.unit-test-form.tab-1[*].naw.voornaam".toCharArray());
        } catch (Exception e) {
            fail(e.getMessage());
        }

        try {
            JsonPathTokenizer.tokenize("$.unit-test-form.tab-1[234.naw.voornaam".toCharArray());
        } catch (Exception e) {
            
            assertEquals("Syntax fout: Karakter '.' niet toegestaan binnen haken op positie 26", e.getMessage());
        }

        try {
            JsonPathTokenizer.tokenize("$.unit-test-form.tab-1234].naw.voornaam".toCharArray());
        } catch (Exception e) {
            assertEquals("Syntax fout: Sluitende haak ']' zonder opening op positie 25", e.getMessage());
        }
        try {
            JsonPathTokenizer.tokenize("$.unit-test-form.tab-[1234].naw.voornaam".toCharArray());
        } catch (Exception e) {
            assertEquals("Syntax fout: Veldnaam mag niet eindigen op '-' op positie 21", e.getMessage());
        }
        
    }

    @Test
    public void jsonPathFinderTest() {
        
        String form = "{\"active\": true,\"fileName\": \"unit-test.json\",\"form\": {\"name\": \"unit-test-form\",\"label\": \"Testformulier\",\"classes\": \"\",\"type\": \"form\",\"metadata\": [\"\"],\"tabs\": [{\"name\": \"tab-1\",\"label\": \"Testtab1\",\"classes\": \"\",\"metadata\": [\"3515\",\"Mooi\",\"Mooi1\",\",jhb\"],\"type\": \"tab\",\"formGroups\": [{\"name\": \"naam\",\"label\": \"\",\"classes\": \"\",\"metadata\": [],\"type\": \"form-group\",\"fields\": [{\"id\": null,\"name\": \"voornaam\",\"label\": \"Voornaam\",\"type\": \"text\",\"placeholder\": \"\",\"classes\": \"\",\"readonly\": false,\"required\": true,\"minlength\": null,\"maxlength\": null,\"value\": \"banaan\",\"metadata\": [],\"data\": {},\"values\": null}]},{\"name\": \"naw\",\"label\": \"\",\"classes\": \"\",\"metadata\": [],\"type\": \"form-group\",\"fields\": [{\"id\": null,\"name\": \"voornaam\",\"label\": \"Voornaam\",\"type\": \"text\",\"placeholder\": \"\",\"classes\": \"\",\"readonly\": false,\"required\": true,\"minlength\": null,\"maxlength\": null,\"value\": \"appel\",\"metadata\": [],\"data\": {},\"values\": null}]}]}]}}";
        try {
            FormWrapper fw = FormServiceLocal.parseFormWrapper(form);
            List<Field> fields = JsonPathFinder.evalTokenized("$.unit-test-form.tab-1[*].voornaam", (Field)fw.getForm());
            assertEquals(2, fields.size());
            assertEquals("banaan", fields.get(0).getValue());
            assertEquals("appel", fields.get(1).getValue());
            
        } catch (JsonProcessingException e) {
            
        }
    
    }
}
