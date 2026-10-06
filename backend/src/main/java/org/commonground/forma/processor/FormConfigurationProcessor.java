package org.commonground.forma.processor;

import org.commonground.forma.database.dao.definition.FormConfigSuccessPageEntity;
import org.commonground.forma.database.dao.definition.FormDefinitionEntity;
import org.commonground.forma.model.form.FormConfig;
import org.commonground.forma.model.form.FormWrapper;
import org.commonground.forma.model.form.fields.Field;
import org.commonground.forma.model.form.fields.TabPage;
import org.commonground.forma.services.config.FormConfigSuccessPageService;
import org.commonground.forma.services.config.FormVariableService;
import org.commonground.forma.services.form.TabPageService;
import org.springframework.stereotype.Component;

@Component 
public class FormConfigurationProcessor  {

    private final TabPageService tabPageService;
    private final FormConfigSuccessPageService successPageService;
    private final FormVariableService formVariableService;
    private final FormConfigSuccessPageService formConfigSuccessPageService;

    public FormConfigurationProcessor(TabPageService tabPageService, 
                                      FormConfigSuccessPageService successPageService,
                                      FormConfigSuccessPageService formConfigSuccessPageService,
                                      FormVariableService formVariableService) {
        this.tabPageService = tabPageService;
        this.successPageService = successPageService;
        this.formVariableService = formVariableService;
        this.formConfigSuccessPageService = formConfigSuccessPageService;
    }
    
    public void processUpdate(FormDefinitionEntity entity, FormWrapper wrapper) {
        entity.retainTabs(wrapper.getIncomingTabIds());

        boolean removeSuccessPage = isSuccessPageMissing(wrapper);
        FormConfig config = wrapper.getFormConfig();

        if (removeSuccessPage) {
            FormConfigSuccessPageEntity formConfigSuccessPageEntity = entity.getFormConfigSuccessPageEntity();
            if (formConfigSuccessPageEntity != null) {
                entity.clearSuccessPage();
                config.setFormConfigSuccessPage(null);
                this.successPageService.delete(formConfigSuccessPageEntity);
            }
        }

        int sortOrderTab = 0;
        
        for (Field field : wrapper.getForm().getFields()) {
            TabPage tabPage = (TabPage) field;
            this.tabPageService.save(entity, tabPage, sortOrderTab++);
        }

        if (!removeSuccessPage) {
            this.formConfigSuccessPageService.saveByForm(entity, config.getFormConfigSuccessPage());
        }
   
    }

    private boolean isSuccessPageMissing(FormWrapper wrapper) {
        return wrapper.getFormConfig() == null
                || wrapper.getFormConfig().getFormConfigSuccessPage() == null
                || wrapper.getFormConfig().getFormConfigSuccessPage().getCustomSuccessPage() == null
                || !wrapper.getFormConfig().getFormConfigSuccessPage().getCustomSuccessPage();
    }

}
