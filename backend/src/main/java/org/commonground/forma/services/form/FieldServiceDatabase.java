package org.commonground.forma.services.form;

import java.util.List;
import java.util.UUID;

import org.commonground.forma.config.tenant.TenantContext;
import org.commonground.forma.database.dao.definition.FormFieldDefinitionEntity;
import org.commonground.forma.database.repository.FormFieldDefinitionRepository;
import org.commonground.forma.mapper.FieldMapper;
import org.commonground.forma.model.form.fields.Field;
import org.commonground.forma.model.settings.Tenant;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@Transactional(readOnly = true)
public class FieldServiceDatabase implements FieldService {
    private final FieldMapper fieldMapper;
    private final FormFieldDefinitionRepository formFieldDefinitionRepository;

    public FieldServiceDatabase(
            FormFieldDefinitionRepository formFieldDefinitionRepository, FieldMapper fieldMapper) {
        this.formFieldDefinitionRepository = formFieldDefinitionRepository;
        this.fieldMapper = fieldMapper;
    }

    public FormFieldDefinitionEntity getFormFieldDefinitionEntityById(UUID id) {
        Tenant tenant = TenantContext.getTenant();
        return this.formFieldDefinitionRepository.findFieldById(id, tenant.getId()).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "{form.field.error.not_found}"));
    }

    @Override
    public List<Field> get(UUID tabPageId) {
        Tenant tenant = TenantContext.getTenant();

        List<FormFieldDefinitionEntity> formFieldDefinitionEntities = this.formFieldDefinitionRepository.findAllByRootId(tabPageId, tenant.getId());
        
        return fieldMapper.toResponseDtoList(formFieldDefinitionEntities);
        
    }

    @Override
    public Field get(UUID tabPageId, UUID id) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'get'");
        
    }
}
