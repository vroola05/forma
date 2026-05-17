package org.commonground.formbuilder.services;

import java.util.UUID;

import org.commonground.formbuilder.database.dao.settings.TenantEntity;
import org.commonground.formbuilder.database.repository.TenantRepository;
import org.commonground.formbuilder.model.settings.Tenant;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class TenantServiceDatabase implements TenantService {

    private final TenantRepository tenantRepository;

    TenantServiceDatabase(TenantRepository tenantRepository) {
        this.tenantRepository = tenantRepository;
    }

    @Override
    @Cacheable(value = "tenants", key = "#tenantSlug")
    public Tenant get(String tenantSlug) {

        if ("system".equals(tenantSlug)) {
            Tenant tenant = new Tenant();
            return tenant;
        }
        TenantEntity tenantEntity = this.tenantRepository.findBySlug(tenantSlug)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "{tenant.error.not_found}"));

        Tenant tenant = new Tenant();
        tenant.setId(tenantEntity.getId());
        tenant.setSlug(tenantEntity.getSlug());
        tenant.setName(tenantEntity.getName());
        tenant.setActive(tenantEntity.isActive());
        tenant.setLogoUrl(tenantEntity.getLogoUrl());
        tenant.setHomePage(tenantEntity.getHomePage());
        
        return tenant;
    }

    @Override
    @CacheEvict(value = "tenants", key = "#tenant.tenantSlug")
    public void save(Tenant tenant) {
        TenantEntity tenantEntity = new TenantEntity();
        tenantEntity.setId(UUID.randomUUID());
        tenantEntity.setSlug(tenant.getSlug());
        tenantEntity.setName(tenant.getName());
        tenantEntity.setActive(tenant.isActive());
        tenantEntity.setLogoUrl(tenant.getLogoUrl());
        tenantEntity.setHomePage(tenant.getHomePage());
        tenantEntity.setContactEmail(tenant.getContactEmail());
    }
    
}
