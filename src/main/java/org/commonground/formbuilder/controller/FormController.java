package org.commonground.formbuilder.controller;

import java.util.List;

import org.commonground.formbuilder.FormBuilderValidator;
import org.commonground.formbuilder.model.FormList;
import org.commonground.formbuilder.model.FormWrapper;
import org.commonground.formbuilder.model.form.Form;
import org.commonground.formbuilder.services.FormServiceLocal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/forms")
public class FormController {
    
    @Autowired
    private FormServiceLocal fileStorageService;

    @GetMapping()
    public List<FormList> getForms() {
        // FormValidator.validate(projectService.getProjectFormDefinition(), projectForm);
        return fileStorageService.list();
    }


    @GetMapping("/{formName}")
    public FormWrapper getForm(@PathVariable String formName) {
        // FormValidator.validate(projectService.getProjectFormDefinition(), projectForm);
        FormWrapper a = fileStorageService.get(formName);
        return a;
    }

    @PostMapping()
    public String postForm(@RequestBody FormWrapper formWrapper) {
        FormBuilderValidator.validate(formWrapper);

        try {
            fileStorageService.save(formWrapper);
        } catch (Exception e) {
            return "Fout bij opslaan: " + e.getMessage();
        }

        return "Het opslaan is gelukt.";
    }

    @PutMapping()
    public String putForm(@PathVariable String formName, @RequestBody Form form) {
        // FormValidator.validate(projectService.getProjectFormDefinition(), projectForm);

        return "Top";
    }
}
