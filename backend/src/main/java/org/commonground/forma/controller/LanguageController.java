package org.commonground.forma.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;
import java.util.Map;

import org.commonground.forma.services.LanguageService;



@RestController
@RequestMapping("/{tenantSlug}/api/language")
public class LanguageController {
    
    @Autowired
    private LanguageService fileStorageService;

    @GetMapping()
    public List<String> getLanguages() {
        return fileStorageService.list();
    }

    @GetMapping("/{lang}")
    public Map<String, String> getLanguage(@PathVariable String lang) {
        return fileStorageService.get(lang);
    }
}
