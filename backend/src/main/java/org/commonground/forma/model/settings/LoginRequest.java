package org.commonground.forma.model.settings;

public record LoginRequest(
    String username,
    String password
) {}
