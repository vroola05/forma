package org.commonground.forma.services;

import java.util.List;
import java.util.UUID;

import org.commonground.forma.database.dao.settings.TenantAuthProviderEntity;
import org.commonground.forma.database.repository.TenantAuthProviderRepository;
import org.commonground.forma.mapper.AuthProviderMapper;
import org.commonground.forma.model.form.idp.FormAuthProvider;
import org.commonground.forma.model.form.idp.TenantAuthProvider;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class IdpServiceImpl implements IdpService {
    private final TenantAuthProviderRepository tenantAuthProviderRepository;
    private final AuthProviderMapper authProviderMapper;

    public IdpServiceImpl(
            TenantAuthProviderRepository tenantAuthProviderRepository,
            AuthProviderMapper authProviderMapper) {
                
        this.tenantAuthProviderRepository = tenantAuthProviderRepository;
        this.authProviderMapper = authProviderMapper;
    }

    @Override
    public List<TenantAuthProvider> getAll(UUID tenantId) {
        List<TenantAuthProviderEntity> authProviderEntities = this.tenantAuthProviderRepository.findByTenantId(tenantId);
        return authProviderEntities.stream().map(authProviderEntity -> this.authProviderMapper
                .toResponseDto(authProviderEntity)).toList();
    }

    @Override
    public TenantAuthProvider get(UUID tenantId, UUID id) {
        if (tenantId == null ||id == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "{idp.error.no_id}");
        }

        TenantAuthProviderEntity authProviderEntity = this.tenantAuthProviderRepository.findByTenantIdAndId(tenantId, id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "{idp.error.not_found}"));

        return this.authProviderMapper.toResponseDto(authProviderEntity);
    }

    @Override
    public List<TenantAuthProviderEntity> getFormTenantAuthProviderEntities(UUID tenantId) {
        if (tenantId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "{idp.error.no_id}");
        }

        return this.tenantAuthProviderRepository.findByTenantId(tenantId);
    }

    @Override
    public List<FormAuthProvider> getFormIdps(UUID tenantId) {
        List<TenantAuthProviderEntity> authProviderEntities = getFormTenantAuthProviderEntities(tenantId);
        return this.authProviderMapper.toResponseDtoForms(authProviderEntities);
    }

    @Override
    public FormAuthProvider getFormIdp(UUID tenantId, UUID id) {
        if (tenantId == null ||id == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "{idp.error.no_id}");
        }

        TenantAuthProviderEntity authProviderEntity = this.tenantAuthProviderRepository.findByTenantIdAndId(tenantId, id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "{idp.error.not_found}"));

        return this.authProviderMapper
                .toResponseDtoForm(this.tenantAuthProviderRepository.save(authProviderEntity));
    }

    @Override
    public TenantAuthProvider createAuthProvider(UUID tenantId, TenantAuthProvider authProvider) {
        if (authProvider.getId() != null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "{idp.error.already_exists}");
        }

        this.tenantAuthProviderRepository.findByTenantIdAndDisplayName(tenantId, authProvider.getDisplayName())
            .ifPresent(existing -> {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "{idp.error.unique.display_name}");
            });
        
        TenantAuthProviderEntity authProviderEntity = this.authProviderMapper.toNewEntity(authProvider);
        authProviderEntity.setTenantId(tenantId);

        return this.authProviderMapper
                .toResponseDto(this.tenantAuthProviderRepository.save(authProviderEntity));
    }
    
    @Override
    public TenantAuthProvider updateAuthProvider(UUID tenantId, TenantAuthProvider authProvider) {
        if (authProvider.getId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "{idp.error.no_id}");
        }

        this.tenantAuthProviderRepository.findByTenantIdAndDisplayName(tenantId, authProvider.getDisplayName())
            .ifPresent(existing -> { 
                if (existing.getId() != authProvider.getId()) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "{idp.error.unique.display_name}");
                }
            });

        TenantAuthProviderEntity authProviderEntity = this.tenantAuthProviderRepository.findByTenantIdAndId(tenantId, authProvider.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "{idp.error.not_found}"));


        this.authProviderMapper.updateEntityFromDto(authProvider, authProviderEntity);
        
        return this.authProviderMapper
                .toResponseDto(this.tenantAuthProviderRepository.save(authProviderEntity));
    }
}
