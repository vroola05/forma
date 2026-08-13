package org.commonground.forma.services;

import java.util.List;
import java.util.UUID;

import org.commonground.forma.config.AppConstants;
import org.commonground.forma.database.dao.settings.TenantEntity;
import org.commonground.forma.database.repository.TenantRepository;
import org.commonground.forma.exceptions.FormFieldError;
import org.commonground.forma.exceptions.FormValidationException;
import org.commonground.forma.mapper.TenantMapper;
import org.commonground.forma.model.settings.Tenant;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import jakarta.transaction.Transactional;

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
    public List<Tenant> getAll() {
        List<TenantEntity> tenantEntities = this.tenantRepository.findAllByOrderByNameAsc();
        return tenantMapper.toResponseDtoList(tenantEntities);
    }

    @Override
    @Cacheable(cacheNames = "tenants", key = "#p0")
    public TenantEntity get(UUID id) {
        return tenantRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "{tenant.error.not_found}"));
    }

    @Override
    @Cacheable(value = "tenants", key = "#slug")
    public Tenant get(String slug) {
        // Return empty tenant for system tenant, as this is not stored in the database
        if (AppConstants.SYSTEM_TENANT_SLUG.equals(slug)) {
            Tenant tenant = new Tenant();
            return tenant;
        }

        TenantEntity tenantEntity = this.tenantRepository.findBySlug(slug)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "{tenant.error.not_found}"));

        return tenantMapper.toResponseDto(tenantEntity);
    }

    @Override
    @CacheEvict(value = "tenants", key = "#p0.slug")
    public Tenant save(Tenant tenant) {
        TenantEntity tenantEntity;

        if (AppConstants.SYSTEM_TENANT_SLUG.contains(tenant.getSlug())) {
            throw new FormValidationException(List.of(new FormFieldError("slug", "slug", "{tenant.error.not_unique}")));
        }

        if (tenant.getId() == null) {
            this.tenantRepository.findBySlug(tenant.getSlug()).ifPresent(existing -> {
                throw new FormValidationException(List.of(new FormFieldError("slug", "slug", "{tenant.error.not_unique}")));
            });
        
            tenantEntity = this.tenantRepository.save(tenantMapper.toNewEntity(tenant));
        } else {
            this.tenantRepository.findBySlugAndIdNot(tenant.getSlug(), tenant.getId()).ifPresent(existing -> {
                throw new FormValidationException(List.of(new FormFieldError("slug", "slug", "{tenant.error.not_unique}")));
            });

            TenantEntity tenantEntityOriginal = this.tenantRepository.findById(tenant.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "{tenant.error.not_found}"));

            tenantMapper.updateEntityFromDto(tenant, tenantEntityOriginal);
            tenantEntity = this.tenantRepository.save(tenantEntityOriginal);
        }

        return tenantMapper.toResponseDto(tenantEntity);
    }

    @Override
    @Transactional
    @CacheEvict(value = "tenants", key = "#p0.slug")
    public TenantEntity save(TenantEntity tenantEntity) {
        return this.tenantRepository.save(tenantEntity);
    }
    
}
