package org.commonground.forma.mapper;

import org.commonground.forma.database.dao.definition.FormDefinitionEntity;
import org.commonground.forma.model.form.FormConfig;
import org.commonground.forma.model.form.FormWrapper;
import org.springframework.stereotype.Component;

@Component
public class FormWrapperMapper {
    private final FormMapper formMapper;
    private final LoginPageMapper loginPageMapper;
    private final SuccessPageMapper successPageMapper;
    private final FormVariableMapper formVariableMapper;

    public FormWrapperMapper(
            FormMapper formMapper,
            LoginPageMapper loginPageMapper,
            SuccessPageMapper successPageMapper,
            FormVariableMapper formVariableMapper) {
        this.formMapper = formMapper;
        this.loginPageMapper = loginPageMapper;
        this.successPageMapper = successPageMapper;
        this.formVariableMapper = formVariableMapper;
    }
    
    public FormWrapper toResponseDto(FormDefinitionEntity entity) {
        FormWrapper formWrapper = new FormWrapper();

        formWrapper.setForm(formMapper.toResponseDto(entity));
        FormConfig formConfig = new FormConfig();
        
        formConfig.setFormConfigLoginPage(this.loginPageMapper.toResponseDto(entity));
        formConfig.setFormConfigSuccessPage(this.successPageMapper.toResponseDto(entity.getSuccessPage()));
        formConfig.setVariables(formVariableMapper.toResponseDtoList(entity.getVariables()));

        formWrapper.setFormConfig(formConfig);
        return formWrapper;
    }
}
