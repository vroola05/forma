package org.commonground.formbuilder.services.form;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.commonground.formbuilder.database.dao.definition.FormDefinitionEntity;
import org.commonground.formbuilder.database.repository.FormDefinitionRepository;
import org.commonground.formbuilder.model.FormConfig;
import org.commonground.formbuilder.model.FormList;
import org.commonground.formbuilder.model.FormWrapper;
import org.commonground.formbuilder.model.form.CheckboxField;
import org.commonground.formbuilder.model.form.Field;
import org.commonground.formbuilder.model.form.FieldType;
import org.commonground.formbuilder.model.form.Form;
import org.commonground.formbuilder.model.form.Option;
import org.commonground.formbuilder.model.form.TabPage;
import org.commonground.formbuilder.model.settings.Tenant;
import org.commonground.formbuilder.services.formConfig.FormConfigSuccessPageService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import jakarta.transaction.Transactional;

@Service
public class FormServiceDatabase implements FormService {
    private final FormDefinitionRepository formDefinitionRepository;
    private final FormConfigSuccessPageService formConfigSuccessPageService;

    private final TabPageService tabPageService;

    public FormServiceDatabase(
            TabPageService tabPageService,
            FormConfigSuccessPageService formConfigSuccessPageService,
            FormDefinitionRepository formDefinitionRepository) {

        this.formDefinitionRepository = formDefinitionRepository;
        this.tabPageService = tabPageService;
        this.formConfigSuccessPageService = formConfigSuccessPageService;
    }

    public FormDefinitionEntity getFormDefinitionById(UUID id) {
        return this.formDefinitionRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "{form.definition.error.not_found}"));
    }

    @Override
    @Transactional
    public String save(Tenant tenant, FormWrapper formWrapper) {

        Form form = formWrapper.getForm();
        FormDefinitionEntity formDefinitionEntity = form.getId() == null
                ? new FormDefinitionEntity()
                : this.getFormDefinitionById(form.getId());

        if (form.getId() == null) {
            formDefinitionEntity.setId(UUID.randomUUID());
        }
        formDefinitionEntity.setTenantId(tenant.getId());
        formDefinitionEntity.setName(form.getName());
        formDefinitionEntity.setLabel(form.getLabel());
        formDefinitionEntity.setClasses(form.getClasses());
        formDefinitionEntity.setMetadata(form.getMetadata());
        formDefinitionEntity.setConfirmation(form.getConfirmation());
        formDefinitionEntity.setCondition(form.getCondition());
        formDefinitionEntity.setShow(form.isShow());

        FormDefinitionEntity resultEntity = this.formDefinitionRepository.save(formDefinitionEntity);

        int sortOrderTab = 0;
        for (Field field : form.getFields()) {
            TabPage tabPage = (TabPage) field;
            this.tabPageService.save(resultEntity, tabPage, sortOrderTab++);
        }
        ;

        FormConfig formConfig = formWrapper.getFormConfig();
        if (formConfig != null) {
            if (formConfig.getFormConfigSuccessPage() != null) {
                this.formConfigSuccessPageService.save(formDefinitionEntity, formConfig.getFormConfigSuccessPage());
            }
        }

        return null;
    }

    @Override
    public FormWrapper get(String formName) {
        FormDefinitionEntity formDefinitionEntity = this.formDefinitionRepository.findByName(formName)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "{form.definition.error.not_found}"));

        return transform(formDefinitionEntity);
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

    @Override
    public FormWrapper transform(FormDefinitionEntity formDefinitionEntity) {
        FormWrapper formWrapper = new FormWrapper();
        
        Form form = new Form();
        form.setId(formDefinitionEntity.getId());
        form.setType(FieldType.FORM);
        form.setName(formDefinitionEntity.getName());
        form.setLabel(formDefinitionEntity.getLabel());
        form.setClasses(formDefinitionEntity.getClasses());
        form.setMetadata(formDefinitionEntity.getMetadata());
        form.setConfirmation(formDefinitionEntity.getConfirmation());
        if (formDefinitionEntity.getConfirmation() != null) {
            for (int i = 0; i < formDefinitionEntity.getConfirmation().size(); i++) {
                CheckboxField check = new CheckboxField();
                check.setType(FieldType.CHECKBOX);

                check.setName("confirmation-" + (i + 1));
                check.setLabel("");
                check.setRequired(true);
                check.setOptions(new ArrayList<>());
                check.getOptions().add(new Option(formDefinitionEntity.getConfirmation().get(i),
                        formDefinitionEntity.getConfirmation().get(i), false));
                form.getConfirmationCheck().add(check);
            }

        }

        form.setCondition(formDefinitionEntity.getCondition());
        form.setShow(formDefinitionEntity.isShow());

        form.setFields(tabPageService.get(formDefinitionEntity.getId()));

        formWrapper.setForm(form);

        formWrapper.setFormConfig(new FormConfig());
        formWrapper.getFormConfig()
                .setFormConfigSuccessPage(this.formConfigSuccessPageService.get(formDefinitionEntity.getId()));

        return formWrapper;
    }

}
