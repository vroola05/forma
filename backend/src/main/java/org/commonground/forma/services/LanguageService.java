package org.commonground.forma.services;

import java.util.List;
import java.util.Map;

public interface LanguageService {
    public List<String> list();
    public Map<String, String> get(String language);
}
