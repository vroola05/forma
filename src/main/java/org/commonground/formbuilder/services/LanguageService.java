package org.commonground.formbuilder.services;

import java.util.List;
import java.util.Map;

public interface LanguageService {
    public List<String> list();
    public Map<String, String> get(String language);
}
