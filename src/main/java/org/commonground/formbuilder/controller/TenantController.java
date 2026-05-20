package org.commonground.formbuilder.controller;

import java.io.IOException;
import java.util.List;

import org.commonground.formbuilder.config.tenant.TenantContext;
import org.commonground.formbuilder.exceptions.FormValidationException;
import org.commonground.formbuilder.model.settings.Tenant;
import org.commonground.formbuilder.services.StorageService;
import org.commonground.formbuilder.services.TenantService;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import io.awspring.cloud.s3.S3Resource;
import jakarta.validation.Valid;

@RestController
@RequestMapping()
public class TenantController {
    private TenantService tenantService;
    private final StorageService storageService;

    private static final List<String> ALLOWED_TYPES = List.of("image/png", "image/svg+xml");

    public TenantController(
            TenantService tenantService,
            StorageService storageService) {
        this.tenantService = tenantService;
        this.storageService = storageService;
    }

    @GetMapping("/{tenantSlug}/api/tenant")
    public Tenant getTenant(@PathVariable() String tenantSlug) {
        Tenant tenant = TenantContext.getTenant();
        if (tenant == null) {
            tenant = new Tenant();
        }
        return tenant;
    }

    @PreAuthorize("hasRole('GLOBAL_ADMIN')")
    @PostMapping("/{tenantSlug}/api/tenant")
    public Tenant postTenant(@PathVariable() String tenantSlug, @Valid @RequestBody Tenant tenant) {
        try {
        Tenant t = this.tenantService.get(tenantSlug);
        } catch (ResponseStatusException e) {
            if (HttpStatus.NOT_FOUND.equals(e.getStatusCode())) {
                throw new FormValidationException(List.of(new FieldError("slug", "slug", "{tenant.error.not_unique}")));
            }
        }
        tenant = this.tenantService.save(tenant);
        
        return tenant;
    }

    @PostMapping("{tenantSlug}/api/tenant/logo")
    public ResponseEntity<String> uploadLogo(
            @PathVariable() String tenantSlug,
            @RequestParam("file") MultipartFile file) {

        Tenant tenant = TenantContext.getTenant();

        if (tenant == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tenant niet gevonend.");
        }

        if (file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Bestand is leeg.");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Ongeldig bestandstype. Alleen PNG en SVG zijn toegestaan.");
        }

        String extension = contentType.equals("image/svg+xml") ? ".svg" : ".png";
        String logoKey = "tenants/" + tenant.getId() + "/assets/logo" + extension;

        try {
            storageService.uploadPublicAsset(logoKey, file.getInputStream());
            tenant.setLogo(logoKey);
            this.tenantService.save(tenant);
            return ResponseEntity.ok("Logo succesvol geüpload.");
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Fout tijdens het opslaan van het logo.");
        }
    }

    @GetMapping("{tenantSlug}/public/logo")
    public ResponseEntity<Resource> getTenantLogo(
        @PathVariable() String tenantSlug
    ) {

        Tenant tenant = TenantContext.getTenant();
        String logoKey = "tenants/" + tenant.getId() + "/assets/logo.svg";

        S3Resource resource = storageService.downloadPublicAsset(logoKey);

        if (!resource.exists()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Logo niet gevonden.");
        }

        String contentType = resource.contentType();
        if (contentType == null) {
            contentType = MediaType.APPLICATION_OCTET_STREAM_VALUE;
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"logo.svg\"")
                .body(resource);
    }
}
