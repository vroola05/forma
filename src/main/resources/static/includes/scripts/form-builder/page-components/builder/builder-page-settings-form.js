import { PageComponent } from '../../../shared/page-components/page-component.js';
import { BuilderFormService } from '../../services/builder-form-service.js';
import { BuilderPropertyComponent } from '../../properties/builder-properties-component.js';
import { BuilderLayout } from './components/builder-layout.js';
import { BuilderFieldItems } from './components/builder-field-items.js';
import { Lang } from '../../../shared/services/lang.js';

export class BuilderPageSettingsForm extends PageComponent {
    #builderLayout = null;
    #builderPropertiesComponent = null;

    constructor() {
        super();

        this.#builderLayout = new BuilderLayout();
        this.#builderPropertiesComponent =  new BuilderPropertyComponent();

        const builderFieldItems = new BuilderFieldItems('Basiscomponenten');
        builderFieldItems.createItems([
            {icon: 'icon-card-text', type: 'form-group', label: Lang.get('field.type.form.group')},
            {icon: 'icon-check-square', type: 'checkbox', label: Lang.get('field.type.checkbox')},
            {icon: 'icon-fonts', type: 'text', label: Lang.get('field.type.text')},
            {icon: 'icon-9-square', type: 'number', label: Lang.get('field.type.number')},
            {icon: 'icon-record-circle', type: 'radio', label: Lang.get('field.type.radio')},
            {icon: 'icon-card-list', type: 'select', label: Lang.get('field.type.select')},
            {icon: 'icon-calendar2-date', type: 'date', label: Lang.get('field.type.date')},
            {icon: 'icon-currency-euro', type: 'valuta', label: Lang.get('field.type.valuta')},
            {icon: 'icon-repeat', type: 'repeating-group', label: Lang.get('field.type.repeating.group')}
        ]);
        this.#builderLayout.setLeftContent(builderFieldItems.getContent());
                
        this.#builderLayout.getCenterContent();
    }

    /**
     * 
     */
    afterInit() {
        console.log('After init f');
        this.#builderLayout.setCenterContent(BuilderFormService.getBuilderForm().getContent());
        this.#builderLayout.setRightContent(this.#builderPropertiesComponent.getContent());
    }

    getContent() {
        return this.#builderLayout.getContent();
    }
}
