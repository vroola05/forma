package org.commonground.forma.services;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.commonground.forma.database.dao.settings.TenantAuthProviderEntity;
import org.commonground.forma.database.dao.settings.TenantAuthProviderGroupEntity;
import org.commonground.forma.database.repository.TenantAuthProviderRepository;
import org.commonground.forma.mapper.AuthProviderMapper;
import org.commonground.forma.model.form.idp.FormAuthProvider;
import org.commonground.forma.model.form.idp.TenantAuthProvider;
import org.commonground.forma.model.form.idp.TenantAuthProviderGroup;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class IdpServiceImpl implements IdpService {
    private final TenantAuthProviderRepository tenantAuthProviderRepository;
    private final AuthProviderMapper authProviderMapper;
    private final GroupService groupService;

    public IdpServiceImpl(
            TenantAuthProviderRepository tenantAuthProviderRepository,
            AuthProviderMapper authProviderMapper,
            GroupService groupService) {

        this.tenantAuthProviderRepository = tenantAuthProviderRepository;
        this.authProviderMapper = authProviderMapper;
        this.groupService = groupService;
    }

    @Override
    public List<TenantAuthProvider> getAll(UUID tenantId) {
        List<TenantAuthProviderEntity> authProviderEntities = this.tenantAuthProviderRepository
                .findByTenantId(tenantId);
        return authProviderEntities.stream().map(authProviderEntity -> this.authProviderMapper
                .toResponseDto(authProviderEntity)).toList();
    }

    @Override
    public TenantAuthProvider get(UUID tenantId, UUID id) {
        if (tenantId == null || id == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "{idp.error.no_id}");
        }

        TenantAuthProviderEntity authProviderEntity = this.tenantAuthProviderRepository
                .findByTenantIdAndId(tenantId, id)
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
        if (tenantId == null || id == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "{idp.error.no_id}");
        }

        TenantAuthProviderEntity authProviderEntity = this.tenantAuthProviderRepository
                .findByTenantIdAndId(tenantId, id)
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

        Map<UUID, TenantAuthProviderGroup> incomingGroupsById = authProvider.getProviderGroups().stream()
                .filter(Objects::nonNull)
                .collect(Collectors.toMap(
                        TenantAuthProviderGroup::getGroupId,
                        Function.identity(),
                        (existing, replacement) -> replacement));

        this.groupService.getEntities(tenantId).stream()
                .filter(Objects::nonNull)
                .filter(g -> incomingGroupsById.containsKey(g.getId()))
                .forEach(newGroup -> {
                    TenantAuthProviderGroup dto = incomingGroupsById.get(newGroup.getId());
                    authProviderEntity.addGroupMapping(newGroup, dto.getExternalId(), dto.getExternalName());
                });

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
                    if (!existing.getId().equals(authProvider.getId())) {
                        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "{idp.error.unique.display_name}");
                    }
                });

        TenantAuthProviderEntity authProviderEntity = this.tenantAuthProviderRepository
                .findByTenantIdAndId(tenantId, authProvider.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "{idp.error.not_found}"));

        this.authProviderMapper.updateEntityFromDto(authProvider, authProviderEntity);

        Map<UUID, TenantAuthProviderGroup> incomingGroupsById = authProvider.getProviderGroups().stream()
                .filter(Objects::nonNull)
                .collect(Collectors.toMap(
                        TenantAuthProviderGroup::getGroupId,
                        Function.identity(),
                        (existing, replacement) -> replacement));

        authProviderEntity.retainGroups(incomingGroupsById.keySet());

        Set<UUID> existingGroupIds = new HashSet<>();
        for (TenantAuthProviderGroupEntity mapping : authProviderEntity.getGroupMapping()) {
            if (mapping == null)
                continue;

            UUID groupId = mapping.getGroup().getId();
            existingGroupIds.add(groupId);

            TenantAuthProviderGroup dto = incomingGroupsById.get(groupId);
            if (dto != null) {
                mapping.setExternalId(dto.getExternalId());
                mapping.setExternalName(dto.getExternalName());
            }
        }

        this.groupService.getEntities(tenantId).stream()
                .filter(Objects::nonNull)
                .filter(g -> incomingGroupsById.containsKey(g.getId()) && !existingGroupIds.contains(g.getId()))
                .forEach(newGroup -> {
                    TenantAuthProviderGroup dto = incomingGroupsById.get(newGroup.getId());
                    authProviderEntity.addGroupMapping(newGroup, dto.getExternalId(), dto.getExternalName());
                });


        return this.authProviderMapper
                .toResponseDto(this.tenantAuthProviderRepository.save(authProviderEntity));
    }
}
