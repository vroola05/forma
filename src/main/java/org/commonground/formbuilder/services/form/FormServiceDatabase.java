package org.commonground.formbuilder.services.form;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.commonground.formbuilder.database.dao.definition.FormDefinitionEntity;
import org.commonground.formbuilder.database.repository.FormDefinitionRepository;
import org.commonground.formbuilder.model.FormList;
import org.commonground.formbuilder.model.FormWrapper;
import org.commonground.formbuilder.model.form.Form;
import org.commonground.formbuilder.model.form.TabPage;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import jakarta.transaction.Transactional;

@Service
public class FormServiceDatabase implements FormService {
    private final FormDefinitionRepository formDefinitionRepository;
    
    private final TabPageService tabPageService;

    public FormServiceDatabase(
        TabPageService tabPageService,
        FormDefinitionRepository formDefinitionRepository) {

        this.formDefinitionRepository = formDefinitionRepository;
        this.tabPageService = tabPageService;
    }

    public FormDefinitionEntity getFormDefinitionById(UUID id) {
        return this.formDefinitionRepository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Form niet gevonden"));
    }

    @Override
    @Transactional
    public String save(FormWrapper formWrapper) {
        
        Form form = formWrapper.getForm();
        FormDefinitionEntity formDefinitionEntity = form.getId() == null ? new FormDefinitionEntity() : this.getFormDefinitionById(form.getId());
        if (form.getId() == null) {
            formDefinitionEntity.setId(UUID.randomUUID());
        }
        formDefinitionEntity.setName(form.getName());
        formDefinitionEntity.setLabel(form.getLabel());
        formDefinitionEntity.setClasses(form.getClasses());
        formDefinitionEntity.setMetadata(form.getMetadata());
        formDefinitionEntity.setSummaryConfirmation(form.getSummaryConfirmation());
        formDefinitionEntity.setCondition(form.getCondition());
        formDefinitionEntity.setShow(form.isShow());

        FormDefinitionEntity resultEntity = this.formDefinitionRepository.save(formDefinitionEntity);

        int sortOrderTab = 0;
        for (TabPage tabPage : form.getTabPages()) {
            this.tabPageService.save(resultEntity, tabPage, sortOrderTab++);
       };
        
        return null;
    }

    @Override
    public FormWrapper get(String formName) {
        FormDefinitionEntity formDefinitionEntity = this.formDefinitionRepository.findByName(formName).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Form niet gevonden"));

        Form form = new Form();
        form.setId(formDefinitionEntity.getId());
        form.setName(formDefinitionEntity.getName());
        form.setLabel(formDefinitionEntity.getLabel());
        form.setClasses(formDefinitionEntity.getClasses());
        form.setMetadata(formDefinitionEntity.getMetadata());
        form.setSummaryConfirmation(formDefinitionEntity.getSummaryConfirmation());
        form.setCondition(formDefinitionEntity.getCondition());
        form.setShow(formDefinitionEntity.isShow());

        form.setFields(tabPageService.get(formDefinitionEntity.getId()));
        
        FormWrapper formWrapper = new FormWrapper();
        formWrapper.setForm(form);



        return formWrapper;
    }

    @Override
    public List<FormList> list() {
        List<FormList> formLists = new ArrayList<>();
        List<FormDefinitionEntity> formDefinitionEntities = this.formDefinitionRepository.findAll();
        formDefinitionEntities.stream().forEach(formDefinitionEntity -> {
            FormList formList = new FormList();
            formList.setId(formDefinitionEntity.getId());
            formList.setName(formDefinitionEntity.getName());
            formList.setLabel(formDefinitionEntity.getLabel());
            formLists.add(formList);
        });

        return formLists;
    }
    
}
