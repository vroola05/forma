package org.commonground.formbuilder.controller;

import java.io.IOException;
import java.util.List;

import org.commonground.formbuilder.config.tenant.TenantContext;
import org.commonground.formbuilder.database.dao.settings.TenantEntity;
import org.commonground.formbuilder.exceptions.FormValidationException;
import org.commonground.formbuilder.model.settings.Tenant;
import org.commonground.formbuilder.model.settings.User;
import org.commonground.formbuilder.model.settings.UserRole;
import org.commonground.formbuilder.services.StorageService;
import org.commonground.formbuilder.services.TenantService;
import org.commonground.formbuilder.services.UserService;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
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
    private UserService userService;
    private final StorageService storageService;

    private static final List<String> ALLOWED_TYPES = List.of("image/png", "image/svg+xml");

    public TenantController(
            TenantService tenantService,
            UserService userService,
            StorageService storageService) {
        this.tenantService = tenantService;
        this.userService = userService;
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
    @PostMapping("/{tenantSlug}/api/tenant/list")
    public List<Tenant> getTenants(@RequestBody Tenant tenant) {
        return this.tenantService.getAll();
    }

    @PreAuthorize("hasRole('GLOBAL_ADMIN')")
    @PostMapping("/{tenantSlug}/api/tenant")
    public Tenant postTenant(@PathVariable() String tenantSlug, @Valid @RequestBody Tenant tenant) {
        
        try {
            Tenant tenantDuplicate = this.tenantService.get(tenant.getSlug());
            if (tenantDuplicate != null) {
                throw new FormValidationException(List.of(new FieldError("slug", "slug", "{tenant.error.not_unique}")));
            }
        } catch (ResponseStatusException e) {
        }
        
        Tenant tenantNew = this.tenantService.save(tenant);
        
        tenant.getTenantAdmin().setRole(UserRole.ROLE_TENANT_ADMIN);
        User user = this.userService.save(tenantNew.getId(), tenant.getTenantAdmin());

        tenantNew.setTenantAdmin(user);
        return tenantNew;
    }

    @PreAuthorize("hasRole('GLOBAL_ADMIN')")
    @PutMapping("/{tenantSlug}/api/tenant/{tenantId}")
    public Tenant putTenant(@PathVariable() String tenantSlug, @PathVariable() String tenantId, @Valid @RequestBody Tenant tenant) {
        
        Tenant tenantNew = this.tenantService.save(tenant);
        
        return tenantNew;
    }


    @PatchMapping("{tenantSlug}/api/tenant/logo")
    public ResponseEntity<String> uploadLogo(
            @PathVariable() String tenantSlug,
            @RequestParam("file") MultipartFile file) {

                System.out.println("Uploading logo for tenant: " + tenantSlug);
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
            
            TenantEntity tenantEntity =  this.tenantService.get(tenant.getId());
            tenantEntity.setLogo(logoKey);
            this.tenantService.save(tenantEntity);

            return ResponseEntity.ok("Logo succesvol geüpload.");
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Fout tijdens het opslaan van het logo.");
        }
    }

    @GetMapping("{tenantSlug}/api/tenant/logo")
    public ResponseEntity<Resource> getTenantLogo(@PathVariable() String tenantSlug) {

        Tenant tenant = TenantContext.getTenant();
        if (tenant == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "{tenant.error.not_found}");
        }
        TenantEntity tenantEntity =  this.tenantService.get(tenant.getId());

        S3Resource resource = storageService.downloadPublicAsset(tenantEntity.getLogo());

        if (!resource.exists()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "{tenant.error.logo_not_found}");
        }

        String contentType = resource.contentType();
        if (contentType == null) {
            contentType = MediaType.APPLICATION_OCTET_STREAM_VALUE;
        }

        String filename = resource.getFilename() != null ? resource.getFilename() : "logo";

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                .body(resource);
    }
}
