import { BuilderFieldInterface } from './builder-field-interface.js';
import { BuilderTabPage } from './builder-tab-page.js';
import { BuilderTabLabel } from './components/builder-tab-label.js'; 
import { EventService } from '../../shared/services/event-service.js';
import { Lang } from '../../shared/services/lang.js'

export class BuilderForm extends BuilderFieldInterface {
    dropzone = null;
    acceptedTypes = ['tab'];

    builderFields = [];

    constructor() {
        super('form', '');

        this.fieldProperties.addProperties([
            {type: 'list', id: 'summaryConfirmation', label: Lang.get('prop.summary.confirmation.label'), value: []}
        ]);

        this.createContent();
    }

    init(properties) {
        if (properties) {
            
            this.initDefaultProperties(properties);

            if (properties.fields) {
                properties.fields.forEach(tab => {
                    
                    console.log('Initializing tab with properties');
                    const field = this.createTab();
                    field.init(tab);
                });
            }
        }
    }

    createContent() {
        this.formItem = document.createElement('div');
        this.formItem.className = 'builder-form';
        this.formItem.setAttribute('data-type', 'form');
        

        ///////////////////////
        // Header
        ///////////////////////
        const builderFormHeaderBar = document.createElement('div');
        builderFormHeaderBar.className = 'builder-form-header-bar';
        this.formItem.appendChild(builderFormHeaderBar);

        this.builderFormFieldHeaderBarLabel = document.createElement('div');
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
            EventService.callEventListener('properties-changed', this);
        });

        const tabLabel = this.createTabLabel();
        this.formItem.appendChild(tabLabel.getContent());

        const builderFormTabContainer = document.createElement('div');
        builderFormTabContainer.className = 'builder-form-tab-container';
        this.formItem.appendChild(builderFormTabContainer);

        const builderFormTabContainerInner = document.createElement('div');
        builderFormTabContainerInner.className = 'builder-form-tab-container-inner';
        builderFormTabContainer.appendChild(builderFormTabContainerInner);

        this.builderFormTab = document.createElement('div');
        this.builderFormTab.className = 'builder-form-tab';
        builderFormTabContainerInner.appendChild(this.builderFormTab);
    }

    /**
     * Create thet tabComponents
     * @returns 
     */
    createTabLabel() {
        this.tabLabelCompontent = new BuilderTabLabel();

        // When a new tab is created
        this.tabLabelCompontent.onCreateCallback = (tabLabelItem) => {
            
                    
            const tabPage = new BuilderTabPage('tab', tabLabelItem.getLabel());
            
            tabLabelItem.setTabPage(tabPage);
            tabPage.setTabLabelItem(tabLabelItem);

            tabPage.onFieldChanged = (properties) => {
                if (this.onPropertiesChangedCallback) {
                    this.onPropertiesChangedCallback(properties);
                }
            };

            this.builderFormTab.appendChild(tabPage.getContent());
            this.builderFields.push(tabPage);
            EventService.callEventListener('properties-changed', tabPage);
            this.tabLabelCompontent.setActive(tabLabelItem);
        };

        this.tabLabelCompontent.onMoveCallback = (draggedIndex, droppedIndex) => {
            const [draggedItem] = this.builderFields.splice(draggedIndex, 1);
            
            if (droppedIndex == null) {
                this.builderFields.push(draggedItem);
            } else {
                this.builderFields.splice(droppedIndex, 0, draggedItem);
            }

            EventService.callEventListener('field-changed', this);
        };

        this.tabLabelCompontent.onActivateCallback = (tabLabelItem) => {
            for (const builderField of this.builderFields) {
                if (builderField.getTabLabelItem() == tabLabelItem) {
                    EventService.callEventListener('properties-changed', tabLabelItem.getTabPage());
                    builderField.getTabLabelItem().setActive(true);
                } else {
                    builderField.getTabLabelItem().setActive(false);
                }
            }
        };

        this.tabLabelCompontent.onDeleteCallback = (tabLabelItem) => {
            EventService.callEventListener('properties-changed', null);
            const index = this.builderFields.findIndex(bf => bf.getTabLabelItem() === tabLabelItem);
            
            if (index !== -1) {
                if (this.builderFields.length > 1 && this.builderFields[index].isActive()) {
                    const newIndex = index > 0 ? index - 1 : index + 1;
                    this.tabLabelCompontent.setActive(this.builderFields[newIndex].getTabLabelItem());
                }

                this.builderFormTab.removeChild(this.builderFields[index].getContent());

                this.builderFields.splice(index, 1);
                
                EventService.callEventListener('field-deleted', this);

            }
        };
        return this.tabLabelCompontent;
    }

    setLabel(value) {
        if (value) {
            this.label = value;
        }

        this.builderFormFieldHeaderBarLabel.innerHTML = `${Lang.get('form.name')}: ${this.label }`;
    }

    createTab() {
        return this.tabLabelCompontent.createTab();
    }

    getContent() {
        return this.formItem;
    }

    updateTab() {
    }

    validate() {
        console.log('Validating form');
        console.log('Validating field properties', this.fieldProperties);
        this.fieldProperties.validateAll(this);
        
        for (const tab of this.builderFields) {
            tab.validate();
        }
    }
    
    getData() {
        return {
            ...this.fieldProperties.getProperties(),
            type: this.type,
            fields: this.builderFields.map(f => f.getData())
        };
    }
}