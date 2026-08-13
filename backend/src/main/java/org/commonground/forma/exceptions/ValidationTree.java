package org.commonground.forma.exceptions;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class ValidationTree {
    private Map<String, Object> errorMap = new LinkedHashMap<>();

    public void addError(String path, String message) {
        String[] pathList = path.split("\\.");
        Map<String, Object> currentErrorMap = errorMap;

        for (int i = 0; i < pathList.length - 1; i++) {
            String part = pathList[i];
            currentErrorMap.computeIfAbsent(part, k -> new LinkedHashMap<String, Object>());
            currentErrorMap = (Map<String, Object>) currentErrorMap.get(part);
        }

        String lastPath = pathList[pathList.length - 1];
        currentErrorMap.computeIfAbsent(lastPath, k -> new ArrayList<String>());

        List<String> errorList = (List<String>) currentErrorMap.get(lastPath);
        errorList.add(message);
    }

    public Map<String, Object> build() {
        return errorMap;
    }
}