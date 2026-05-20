package org.commonground.formbuilder.services;

import java.util.UUID;

import org.commonground.formbuilder.database.dao.settings.TenantEntity;
import org.commonground.formbuilder.database.repository.TenantRepository;
import org.commonground.formbuilder.mapper.TenantMapper;
import org.commonground.formbuilder.model.settings.Tenant;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class TenantServiceDatabase implements TenantService {

    private final TenantMapper tenantMapper;
    private final TenantRepository tenantRepository;

    TenantServiceDatabase(
        TenantMapper tenantMapper,
        TenantRepository tenantRepository) {
        this.tenantMapper = tenantMapper;
        this.tenantRepository = tenantRepository;
    }

    @Override
    @Cacheable(value = "tenants", key = "#slug")
    public Tenant get(String tenantSlug) {

        if ("system".equals(tenantSlug)) {
            Tenant tenant = new Tenant();
            return tenant;
        }
        TenantEntity tenantEntity = this.tenantRepository.findBySlug(tenantSlug)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "{tenant.error.not_found}"));

        return tenantMapper.toResponseDto(tenantEntity);
    }

    @Override
    @CacheEvict(value = "tenants", key = "#tenant.slug")
    public Tenant save(Tenant tenant) {
        TenantEntity tenantEntity;
        if (tenant.getId() == null) {
            tenantEntity = this.tenantRepository.save(tenantMapper.toNewEntity(tenant));
        } else {
            TenantEntity tenantEntityOriginal = this.tenantRepository.findById(tenant.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "{tenant.error.not_found}"));
            
            tenantMapper.updateEntityFromDto(tenant, tenantEntityOriginal);
            tenantEntity = this.tenantRepository.save(tenantEntityOriginal);
        }
        
        return tenantMapper.toResponseDto(tenantEntity);
    }
    
}
