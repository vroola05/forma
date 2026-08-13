import { BuilderFormService } from '../../services/builder-form-service';
import { BuilderPropertyComponent } from '../../properties/builder-properties-component';
import { BuilderLayout } from './components/builder-layout';
import { BuilderFieldItems } from './components/builder-field-items';
import { Lang } from '../../../shared/services/lang';
import { BuilderPropertiesService } from '../../services/builder-properties-service';
import { Page } from '../../../shared/page-components/page';
import { FIELD_TYPE } from '../../types';

export class BuilderPageSettingsForm extends Page {
    #builderLayout: BuilderLayout = new BuilderLayout();
    #builderPropertiesComponent = new BuilderPropertyComponent();

    constructor() {
        super();

        BuilderPropertiesService.clear();

        const builderFieldItemsGroups = new BuilderFieldItems('Groepen');
        builderFieldItemsGroups.createItems([
            {icon: 'icon-card-text', type: FIELD_TYPE.FORM_GROUP, label: Lang.get('field.type.form.group')},
            {icon: 'icon-repeat', type: FIELD_TYPE.REPEATING_GROUP, label: Lang.get('field.type.repeating.group')}
        ]);

        this.#builderLayout.setLeftContent(builderFieldItemsGroups.getContent());

        const builderFieldItemsBasic = new BuilderFieldItems('Basiscomponenten');
        builderFieldItemsBasic.createItems([
            {icon: 'icon-fonts', type: FIELD_TYPE.TEXT, label: Lang.get('field.type.text')},
            {icon: 'icon-9-square', type: FIELD_TYPE.NUMBER, label: Lang.get('field.type.number')},

            {icon: 'icon-calendar2-date', type: FIELD_TYPE.DATE, label: Lang.get('field.type.date')},
            {icon: 'icon-record-circle', type: FIELD_TYPE.RADIO, label: Lang.get('field.type.radio')},
            {icon: 'icon-card-list', type: FIELD_TYPE.SELECT, label: Lang.get('field.type.select')},
            {icon: 'icon-check-square', type: FIELD_TYPE.CHECKBOX, label: Lang.get('field.type.checkbox')},

            {icon: 'icon-currency-euro', type: FIELD_TYPE.VALUTA, label: Lang.get('field.type.valuta')},
            {icon: 'icon-palette', type: FIELD_TYPE.COLOR, label: Lang.get('field.type.color')},
            {icon: 'icon-signpost-2', type: FIELD_TYPE.DUAL_LISTBOX, label: Lang.get('field.type.dual.list')},
            {icon: 'icon-file-earmark-plus', type: FIELD_TYPE.FILE, label: Lang.get('field.type.file')},
            {icon: 'icon-incognito', type: FIELD_TYPE.PASSWORD, label: Lang.get('field.type.password')},
            {icon: 'icon-tag', type: FIELD_TYPE.LABEL, label: Lang.get('field.type.label')},
            {icon: 'icon-eye-slash', type: FIELD_TYPE.HIDDEN, label: Lang.get('field.type.hidden')},
            

        ]);
        
        this.#builderLayout.setLeftContent(builderFieldItemsBasic.getContent());
        this.#builderLayout.getCenterContent();

        this.#builderLayout.onClose(() => {
            BuilderPropertiesService.set(undefined);
        });

        this.#builderPropertiesComponent.onFieldChanged((field) => {
            this.#builderLayout.setRightActive(field === undefined ? false : true);
        });
    }

    /**
     * 
     */
    afterInit() {
        const content = BuilderFormService?.getBuilderForm()?.getContent();
        if (content) {
            this.#builderLayout.setCenterContent(content);
        }
        
        this.#builderLayout.setRightContent(this.#builderPropertiesComponent.getContent());

    }

    getContent() {
        return this.#builderLayout.getContent();
    }

    destroy() {
        super.destroy();

        this.#builderPropertiesComponent.destroy();
    }
}
