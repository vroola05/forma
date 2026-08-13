import { BuilderFieldInterface } from './builder-field-interface';
import { BuilderTabPage } from './builder-tab-page';
import { BuilderTabComponent } from './components/builder-tab-component'; 
import { EventService } from '../../shared/services/event-service';
import { BuilderPropertiesService } from '../services/builder-properties-service';
import { Lang } from '../../shared/services/lang'
import { BaseFieldDto, FORM_STATUS } from '../../shared/model/types'
import { FIELD_TYPE, FieldProperty, PROPERTY_TYPE } from '../types';

export class BuilderForm extends BuilderFieldInterface {
    content = document.createElement('div');
    builderFormFieldHeaderBarLabel = document.createElement('div');
    

    builderTabComponent: BuilderTabComponent = new BuilderTabComponent(this);

    acceptedTypes = ['tab'];

    fields: BuilderTabPage[] = [];

    constructor() {
        super(FIELD_TYPE.FORM, '');

        this.fieldProperties.addProperties([
            {type: PROPERTY_TYPE.SELECT, id: 'status', order: 6, label: Lang.get('generic.status'), value: [], 
                options: Object.entries(FORM_STATUS).map(([key, val_fnc]) => ({value: key, text: val_fnc()}))
            },
            {type: PROPERTY_TYPE.LIST, id: 'confirmation', order: 7, label: Lang.get('prop.summary.confirmation.label'), value: []},
        ]);

        this.createContent();
    }

    init(baseFieldDto: BaseFieldDto) {
        this.fieldProperties.setPropertyValueById('name', Lang.get('field.type.form.form').toLowerCase().replace(/\s+/g, '-'));
        this.fieldProperties.setPropertyValueById('label', Lang.get('field.type.form.form'));

        if (baseFieldDto) {
            this.initDefaultProperties(baseFieldDto);

            if (baseFieldDto.fields) {
                baseFieldDto.fields.forEach(tab => {
                    const field = this.createTab();
                    if (field) {
                        field.init(tab);
                    }
                });
            }
        }
    }

    createContent() {
        
        this.content.className = 'builder-form';
        this.content.setAttribute('data-type', 'form');
        

        ///////////////////////
        // Header
        ///////////////////////
        const builderFormHeaderBar = document.createElement('div');
        builderFormHeaderBar.className = 'builder-form-header-bar';
        this.content.appendChild(builderFormHeaderBar);

        this.builderFormFieldHeaderBarLabel.className = 'builder-form-header-bar-label';
        builderFormHeaderBar.appendChild(this.builderFormFieldHeaderBarLabel);
        this.setLabel();

        const builderFormHeaderBarButtons = document.createElement('div');
        builderFormHeaderBarButtons.className = 'builder-form-header-bar-buttons';
        builderFormHeaderBar.appendChild(builderFormHeaderBarButtons);

        const builderFormBtnEdit = document.createElement('button');
        builderFormBtnEdit.className = 'builder-btn-icon icon icon-three-dots-vertical';
        builderFormBtnEdit.setAttribute('aria-label', "Close");
        builderFormHeaderBarButtons.appendChild(builderFormBtnEdit);
        
        builderFormBtnEdit.addEventListener('click', (event) => {
            event.preventDefault();
            BuilderPropertiesService.set(this);
        });

        const tabComponent = this.initTabComponent();
        this.content.appendChild(tabComponent.getContent());

    }


    /**
     * Create thet tabComponents
     * @returns 
     */
    initTabComponent() {
        // When a new tab is created
        this.builderTabComponent.onCreateCallback = (tab) => {
            EventService.emit('field-changed', this);
        };

        this.builderTabComponent.onMoveCallback = () => {
            EventService.emit('field-changed', this);
        };

        this.builderTabComponent.onActivateCallback = (tabLabel) => {
            
        };

        this.builderTabComponent.onDeleteCallback = (tabLabel) => {
            BuilderPropertiesService.clear();
        };
        return this.builderTabComponent;
    }

    setLabel(value: string | undefined = undefined) {
        if (value) {
            this.label = value;
        }

        this.builderFormFieldHeaderBarLabel.innerHTML = `${Lang.get('builder.form.name')}: ${this.label }`;
    }

    createTab() {
        return this.builderTabComponent.createTab();
    }

    getContent() {
        return this.content;
    }

    updateTab() {
    }

    getFields() {
        return this.builderTabComponent.getTabs();
    }

    validate() {

        this.fieldProperties.validateAll(this);
        
        const fields = this.getFields();
        for (const field of fields) {
            field.validate();
        }
    }
    
    getData(): BaseFieldDto {
        const fields = this.getFields();
        return {
            ...this.fieldProperties.getProperties(),
            type: this.type,
            fields: fields.map(f => f.getData())
        };
    }
}