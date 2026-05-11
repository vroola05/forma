package org.commonground.formbuilder.controller;

import java.util.List;

import org.commonground.formbuilder.FormBuilderValidator;
import org.commonground.formbuilder.model.FormList;
import org.commonground.formbuilder.model.FormWrapper;
import org.commonground.formbuilder.services.form.FormServiceDatabase;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/form-builder/form")
public class BuilderController {
        private final FormServiceDatabase formServiceDatabase;

    BuilderController(FormServiceDatabase formServiceDatabase) {

        this.formServiceDatabase = formServiceDatabase;
    }

    @GetMapping()
    public List<FormList> getForms() {
        return formServiceDatabase.list();
        // return fileStorageService.list();
    }

    @GetMapping("/{formName}")
    public FormWrapper getForm(@PathVariable String formName) {
        System.out.println("getBuilderForm");
        return formServiceDatabase.get(formName);
        // return fileStorageService.get(formName);
        
    }

    @PostMapping()
    public String postBuilderForm(@RequestBody FormWrapper formWrapper) {
        FormBuilderValidator.validate(formWrapper);
        System.out.println("postBuilderForm");
        try {
            // fileStorageService.save(formWrapper);
            formServiceDatabase.save(formWrapper);
        } catch (Exception e) {
            return "Fout bij opslaan: " + e.getMessage();
        }

        return "Het opslaan is gelukt.";
    }
}
