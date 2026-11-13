package org.commonground.forma.services.form;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.commonground.forma.database.dao.definition.FormTabDefinitionEntity;
import org.commonground.forma.database.dao.definition.FormTabInstanceDefinitionEntity;
import org.commonground.forma.database.repository.FormTabDefinitionEntityRepository;
import org.commonground.forma.database.repository.FormTabInstanceDefinitionRepository;
import org.commonground.forma.mapper.TabPageMapper;
import org.commonground.forma.model.form.fields.Field;
import org.commonground.forma.model.form.fields.TabPage;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@Transactional(readOnly = true)
public class TabPageServiceDatabase implements TabPageService {
    private final TabPageMapper tabPageMapper;
    private final FieldService fieldService;
    private final FormTabDefinitionEntityRepository formTabDefinitionEntityRepository;
    private final FormTabInstanceDefinitionRepository formTabInstanceDefinitionRepository;

    public TabPageServiceDatabase(
            TabPageMapper tabPageMapper,

            FieldService fieldService,
            FormTabDefinitionEntityRepository formTabDefinitionEntityRepository,
            FormTabInstanceDefinitionRepository formTabInstanceDefinitionRepository) {
        this.tabPageMapper = tabPageMapper;

        this.fieldService = fieldService;
        this.formTabDefinitionEntityRepository = formTabDefinitionEntityRepository;
        this.formTabInstanceDefinitionRepository = formTabInstanceDefinitionRepository;
    }

    public FormTabDefinitionEntity getFormTabDefinitionById(UUID id) {
        return this.formTabDefinitionEntityRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "{form.tab.error.not_found}"));
    }

    @Override
    public List<Field> get(UUID formId) {
        List<Field> tabPages = new ArrayList<>();
        List<FormTabInstanceDefinitionEntity> formTabInstanceDefinitionEntities = this.formTabInstanceDefinitionRepository
                .findAllByFormIdOrderBySortOrderAsc(formId);
        for (FormTabInstanceDefinitionEntity formTabInstanceDefinitionEntity : formTabInstanceDefinitionEntities) {
            FormTabDefinitionEntity formTabDefinitionEntity = formTabInstanceDefinitionEntity.getTab();
            TabPage tabPage = this.tabPageMapper.toResponseDto(formTabDefinitionEntity);

            tabPages.add(tabPage);

            tabPage.setFields(this.fieldService.get(formTabDefinitionEntity.getId()));
        }
        return tabPages;
    }

    @Override
    public TabPage get(UUID formId, UUID id) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'get'");
    }


}
