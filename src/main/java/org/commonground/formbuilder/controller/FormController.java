package org.commonground.formbuilder.controller;

import java.util.List;

import org.commonground.formbuilder.FormValidator;
import org.commonground.formbuilder.model.FormList;
import org.commonground.formbuilder.model.FormWrapper;
import org.commonground.formbuilder.model.form.Form;
import org.commonground.formbuilder.services.form.FormServiceDatabase;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/forms")
public class FormController {
    
    @Autowired
    private FormServiceDatabase fileDatabaseService;

    @GetMapping()
    public List<FormList> getForms() {
        return fileDatabaseService.list();
    }


    @GetMapping("/{formName}")
    public FormWrapper getForm(@PathVariable String formName) {
        System.out.println("getForm: " + formName);

        return fileDatabaseService.get(formName);
    }

    @PostMapping()
    public String postForm(@RequestBody Form form) {
        System.out.println("postForm");

        FormWrapper formWrapperDefinition = fileDatabaseService.get(form.getName());

        FormValidator.validate(form, formWrapperDefinition.getForm());

        return "Het opslaan is gelukt.";
    }
}
