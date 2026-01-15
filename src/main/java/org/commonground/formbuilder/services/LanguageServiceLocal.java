package org.commonground.formbuilder.services;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.commonground.formbuilder.config.FileStorageProperties;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;



@Service
public class LanguageServiceLocal implements LanguageService {

    private final Path storageLocation;

    private static final String LANGUAGE_PATH = "config/i18n/";
    private static final String LANGUAGE_FILE = "languages.json";
    private static List<String> LANGUAGES = null;

    public LanguageServiceLocal(FileStorageProperties properties) {
        this.storageLocation = Paths.get(properties.getPath()).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.storageLocation);
        } catch (IOException e) {
            throw new RuntimeException("Kan opslaglocatie niet aanmaken!", e);
        }
        LANGUAGES = list();
    }

    @Override
    public List<String> list() {
        if (LANGUAGES != null) {
            return LANGUAGES;
        } 

        List<String> languages = new ArrayList<>();
        Resource resource = new ClassPathResource(LANGUAGE_PATH + LANGUAGE_FILE);

        try (InputStream inputStream = resource.getInputStream()) {
            ObjectMapper objectMapper = new ObjectMapper();
            languages = objectMapper.readValue(inputStream, new TypeReference<List<String>>(){});
        } catch (IOException e) {
        }
        
        return languages;
    }

    @Override
    public Map<String, String> get(String language) {
        if (LANGUAGES.contains(language)) {

            Resource resource = new ClassPathResource(LANGUAGE_PATH + "lang/" + language + ".json");

            try (InputStream inputStream = resource.getInputStream()) {
                ObjectMapper objectMapper = new ObjectMapper();
                return objectMapper.readValue(inputStream, new TypeReference<Map<String, String>>(){});
            } catch (IOException e) {
            }
        }
        return null;
    }


   
    
}
