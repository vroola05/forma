package org.commonground.formbuilder.services.submission;

import java.time.OffsetDateTime;
import java.util.UUID;

import org.commonground.formbuilder.database.dao.definition.FormDefinitionEntity;
import org.commonground.formbuilder.database.dao.submission.FormSubmissionEntity;
import org.commonground.formbuilder.database.repository.FormDefinitionRepository;
import org.commonground.formbuilder.database.repository.FormSubmissionRepository;
import org.commonground.formbuilder.model.form.Field;
import org.commonground.formbuilder.model.form.Form;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import jakarta.transaction.Transactional;

@Service
public class FormSubmissionDatabaseService implements FormSubmissionService {
    private final FormSubmissionRepository formSubmissionRepository;
    private final FormDefinitionRepository formDefinitionRepository;

    public FormSubmissionDatabaseService(
        FormSubmissionRepository formSubmissionRepository,
        FormDefinitionRepository formDefinitionRepository
    ) {
        this.formSubmissionRepository = formSubmissionRepository;
        this.formDefinitionRepository = formDefinitionRepository;
    }

    @Override
    public FormSubmissionEntity getFormSubmissionEntity(UUID id) {
        return formSubmissionRepository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Form niet gevonden"));
    }

    @Override
    @Transactional
    public UUID save(Form form) {
        FormDefinitionEntity formDefinitionEntity = this.formDefinitionRepository.findById(form.getId()).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Form niet gevonden"));
        
        FormSubmissionEntity formSubmissionEntity = new FormSubmissionEntity();
        formSubmissionEntity.setId(UUID.randomUUID());
        formSubmissionEntity.setModifiedAt(OffsetDateTime.now());
        
        formSubmissionEntity.setFormDefinitionId(formDefinitionEntity.getId());
        formSubmissionEntity.setFormName(formDefinitionEntity.getName());
        formSubmissionEntity.setFormVersion(formDefinitionEntity.getVersion().longValue());
        formSubmissionEntity.setData(form);

        FormSubmissionEntity result = formSubmissionRepository.save(formSubmissionEntity);

        return result.getId();
    }
}
