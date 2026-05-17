package org.commonground.formbuilder.model.settings;

public record LoginRequest(
    String username,
    String password
) {}
