package org.commonground.forma.services.submission;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.commonground.forma.database.dao.definition.FormDefinitionEntity;
import org.commonground.forma.database.dao.submission.FormSubmissionEntity;
import org.commonground.forma.database.dao.submission.FormSubmissionFileEntity;
import org.commonground.forma.database.repository.FormDefinitionRepository;
import org.commonground.forma.database.repository.FormSubmissionRepository;
import org.commonground.forma.mapper.SubmissionMapper;
import org.commonground.forma.model.form.Option;
import org.commonground.forma.model.form.constants.FieldType;
import org.commonground.forma.model.form.fields.Field;
import org.commonground.forma.model.form.fields.FileField;
import org.commonground.forma.model.form.fields.Form;
import org.commonground.forma.services.FileService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import jakarta.transaction.Transactional;

@Service
public class FormSubmissionDatabaseService implements FormSubmissionService {
    private final FormSubmissionRepository formSubmissionRepository;
    private final FormDefinitionRepository formDefinitionRepository;
    private final SubmissionMapper submissionMapper;
    private final FileService fileService;

    public FormSubmissionDatabaseService(
        FormSubmissionRepository formSubmissionRepository,
        FormDefinitionRepository formDefinitionRepository,
        SubmissionMapper submissionMapper,
        FileService fileService
    ) {
        this.formSubmissionRepository = formSubmissionRepository;
        this.formDefinitionRepository = formDefinitionRepository;
        this.submissionMapper = submissionMapper;
        this.fileService = fileService;
    }

    @Override
    public FormSubmissionEntity getFormSubmissionEntity(UUID id) {
        return formSubmissionRepository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "{form.submission.error.not_found}"));
    }

    @Override
    @Transactional
    public UUID save(UUID tenantId, Form form) {
        FormDefinitionEntity formDefinitionEntity = this.formDefinitionRepository.findById(form.getId()).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "{form.definition.error.not_found}"));
        if (!formDefinitionEntity.getTenantId().equals(tenantId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "{tenant.error.not_found}");
        }

        // - First save the submission
        //   With the files in the database.
        // - Second move the files to the permanent location
        // - Third second
        FormSubmissionEntity formSubmissionEntity = submissionMapper.toNewEntity(form,
                tenantId,
                formDefinitionEntity.getId(),
                formDefinitionEntity.getName(),
                formDefinitionEntity.getVersion().longValue());

        
        List<FileField> fileFields = getFileInputs(form.getFields());
        for (FileField fileField : fileFields) {
            addFilesToSubmission(formSubmissionEntity, fileField, form.getClientSessionId());
        }

        FormSubmissionEntity result = formSubmissionRepository.save(formSubmissionEntity);

        return result.getId();
    }

    public void addFilesToSubmission(FormSubmissionEntity formSubmissionEntity, FileField fileField, UUID clientSessionId) {
        List<Option> options = fileField.getValues();
        for (Option option : options) {
            FormSubmissionFileEntity formSubmissionFileEntity =  createFileEntity(formSubmissionEntity.getId(), clientSessionId, fileField.getMaxFileSize(), option);
            formSubmissionFileEntity.setFormSubmission(formSubmissionEntity);
            formSubmissionEntity.getFormFiles().add(formSubmissionFileEntity);
        }
    }

    public FormSubmissionFileEntity createFileEntity(UUID submissionId, UUID clientSessionId, Long maxFileSize, Option option) {
        String storedFilename = option.getValue();
        String originalFilename = option.getText();

        FormSubmissionFileEntity formSubmissionFileEntity = new FormSubmissionFileEntity();
        formSubmissionFileEntity.setId(UUID.randomUUID());

        
        this.fileService.moveDocmentBucket(submissionId, clientSessionId, maxFileSize, storedFilename, formSubmissionFileEntity);
        formSubmissionFileEntity.setFileName(originalFilename);
        
        return formSubmissionFileEntity;
    }

    public List<FileField> getFileInputs(List<Field> fields) {
        List<FileField> result = new ArrayList<>();
        for(Field field : fields) {
            if (field.getFields() != null) {
                result.addAll(getFileInputs(field.getFields()));
            } else 
            if (FieldType.FILE.equals(field.getType())) {
                
                result.add((FileField)field);
            }
        }

        return result;
    }
}
