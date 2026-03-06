package org.commonground.formbuilder.database.repository;

import org.commonground.formbuilder.database.dao.definition.FormTabInstanceDefinitionEntity;
import org.commonground.formbuilder.database.dao.definition.FormTabInstanceIdEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface FormTabInstanceDefinitionRepository extends JpaRepository<FormTabInstanceDefinitionEntity, FormTabInstanceIdEntity> {
    
    // Handig om alle tabbladen van één specifiek formulier op te halen, gesorteerd op volgorde
    List<FormTabInstanceDefinitionEntity> findAllByFormIdOrderBySortOrderAsc(UUID formId);
    
    // Handig om te controleren of een tab nog ergens anders wordt gebruikt (al doet de trigger dit ook)
    long countByTabId(UUID tabId);
}
