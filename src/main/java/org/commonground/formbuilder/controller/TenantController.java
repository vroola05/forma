package org.commonground.formbuilder.controller;

import java.io.IOException;
import java.util.List;
import java.util.Set;

import org.commonground.formbuilder.config.tenant.TenantContext;
import org.commonground.formbuilder.database.dao.settings.TenantEntity;
import org.commonground.formbuilder.model.constants.TenantStatus;
import org.commonground.formbuilder.model.settings.Group;
import org.commonground.formbuilder.model.settings.Tenant;
import org.commonground.formbuilder.services.GroupService;
import org.commonground.formbuilder.services.StorageService;
import org.commonground.formbuilder.services.TenantService;
import org.commonground.formbuilder.services.UserService;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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
    private final TenantService tenantService;
    private final UserService userService;
    private final StorageService storageService;
    private final GroupService groupService;

    private static final List<String> ALLOWED_TYPES = List.of("image/png", "image/svg+xml");

    public TenantController(
            TenantService tenantService,
            UserService userService,
            StorageService storageService,
            GroupService groupService) {
        this.tenantService = tenantService;
        this.userService = userService;
        this.storageService = storageService;
        this.groupService = groupService;
    }

    @GetMapping("/{tenantSlug}/api/tenant")
    public Tenant getTenant(@PathVariable() String tenantSlug) {
        Tenant tenant = TenantContext.getTenant();
        if (tenant == null) {
            tenant = new Tenant();
        }
        return tenant;
    }

    @PreAuthorize("hasAuthority(@Permissions.TENANT_READ_INTERNAL)")
    @PostMapping("/{tenantSlug}/api/tenant/list")
    public List<Tenant> getTenants(@RequestBody Tenant tenant) {
        return this.tenantService.getAll();
    }

    @PreAuthorize("hasAuthority(@Permissions.TENANT_CREATE)")
    @PostMapping("/{tenantSlug}/api/tenant")
    public Tenant postTenant(@PathVariable() String tenantSlug, @Valid @RequestBody Tenant tenant) {

        if (tenant.getId() != null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "{tenant.error.id_must_be_null}");
        }

        tenant.setStatus(TenantStatus.ACTIVE);
        // Save the tenant
        Tenant tenantNew = this.tenantService.save(tenant);
        // Create admin group for the tenant
        Group adminGroup = this.groupService.createTenantAdminGroup(tenantNew.getId());
        tenant.getTenantAdmin().setGroups(Set.of(adminGroup));

        // Save the tenant admin user
        this.userService.createUser(tenantNew.getId(), tenant.getTenantAdmin());

        return tenantNew;
    }

    @PreAuthorize("hasAuthority(@Permissions.TENANT_UPDATE)")
    @PutMapping("/{tenantSlug}/api/tenant/{tenantId}")
    public Tenant putTenant(@PathVariable() String tenantSlug, @PathVariable() String tenantId, @Valid @RequestBody Tenant tenant) {
        if (tenantId == null || !tenantId.equals(tenant.getId().toString())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "{tenant.error.no_id}");
        }

        Tenant tenantNew = this.tenantService.save(tenant);
        return tenantNew;
    }

    @PreAuthorize("hasAuthority(@Permissions.TENANT_UPDATE_INTERNAL)")
    @PutMapping("/{tenantSlug}/api/tenant/{tenantId}/internal")
    public Tenant putTenantInternal(@PathVariable() String tenantSlug, @PathVariable() String tenantId, @Valid @RequestBody Tenant tenant) {
        if (tenantId == null || !tenantId.equals(tenant.getId().toString())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "{tenant.error.no_id}");
        }

        Tenant tenantNew = this.tenantService.save(tenant);
        return tenantNew;
    }

    @PreAuthorize("hasAuthority(@Permissions.TENANT_UPDATE)")
    @PatchMapping("{tenantSlug}/api/tenant/logo")
    public ResponseEntity<String> uploadLogo(
            @PathVariable() String tenantSlug,
            @RequestParam("file") MultipartFile file) {

                System.out.println("Uploading logo for tenant: " + tenantSlug);
        Tenant tenant = TenantContext.getTenant();

        if (tenant == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "{tenant.error.not_found}");
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
        if (tenant == null || tenant.getId() == null) {
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
