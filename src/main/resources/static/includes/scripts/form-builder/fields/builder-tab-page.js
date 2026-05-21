import { BuilderFieldInterface } from "../fields/builder-field-interface.js";
import { Dropzone } from './components/dropzone.js';
import { EventService } from '../../shared/services/event-service.js';
import { FIELD_TYPES } from '../field-types.js'

export class BuilderTabPage extends BuilderFieldInterface {
    dropzone = null;
    acceptedTypes = ['form-group', 'text', 'number', 'date', 'select', 'radio', 'valuta', 'repeating-group'];
    tabLabelItem = null;
    active = false;

    builderChildFields = [];

    constructor(type, label) {
        super(type, label);
        this.createContent(type, label);
    }

    init(properties) {
        if (properties) {
            this.initDefaultProperties(properties);

            for (const fieldData of properties.fields) {
                const field = this.dropzone.addNewItem(fieldData.type, FIELD_TYPES[fieldData.type]);
                field.init(fieldData);
            }
        }
    }

    createContent(type, label) {
        this.builderTabPage = document.createElement('div');
        this.builderTabPage.className = 'builder-tab-page';
        this.builderTabPage.setAttribute('data-type', type);
        this.builderTabPage.addEventListener("dragstart", (event) => {
            if (this.onDragStart) {
                this.onDragStart(event);
            }   
        });

        const builderTabPageHeaderBar = document.createElement('div');
        builderTabPageHeaderBar.className = 'builder-tab-page-header-bar';
        this.builderTabPage.appendChild(builderTabPageHeaderBar);

        this.builderTabPageHeaderBarLabel = document.createElement('div');
        this.builderTabPageHeaderBarLabel.className = 'builder-tab-page-header-bar-label';
        builderTabPageHeaderBar.appendChild(this.builderTabPageHeaderBarLabel);

        const builderTabPageHeaderBarButtons = document.createElement('div');
        builderTabPageHeaderBarButtons.className = 'builder-tab-page-header-bar-buttons';
        builderTabPageHeaderBar.appendChild(builderTabPageHeaderBarButtons);

        const builderTabPageBtnEdit = document.createElement('button');
        builderTabPageBtnEdit.className = 'builder-btn-icon icon icon-three-dots-vertical';
        builderTabPageBtnEdit.setAttribute('aria-label', "Close");
        builderTabPageHeaderBarButtons.appendChild(builderTabPageBtnEdit);
        builderTabPageBtnEdit.addEventListener('click', (event) => {
            event.preventDefault();
            EventService.emit('properties-changed', this);
        });

        const builderTabPagesContainer = document.createElement('div');
        builderTabPagesContainer.className = 'builder-tab-pages-container';
        this.builderTabPage.appendChild(builderTabPagesContainer);

        this.builderTabPages = document.createElement('div');
        this.builderTabPages.className = 'builder-tab-pages';
        builderTabPagesContainer.appendChild(this.builderTabPages);

        this.dropzone = new Dropzone(
            this,
            this.builderTabPages,
            (type, label, dragged, droppedOnformItem) => {
                this.updateTabPage();
            },
            (type, label, dragged, droppedOnformItem) => {
                this.updateTabPage();
            },
            (properties) => {
                this.updateTabPage();
            }).setAcceptedTypes(this.acceptedTypes);
    }

    getTabLabelItem() {
        return this.tabLabelItem;
    }

    setTabLabelItem(tabLabelItem) {
        this.tabLabelItem = tabLabelItem;
    }

    setLabel(value) {
        if (value) {
            this.label = value;
        }
        this.tabLabelItem.setLabel(value);
    }

    getFields() {
        return this.builderChildFields;
    }

    getContent() {
        return this.builderTabPage;
    }

    updateTabPage() {
        EventService.emit('field-changed', this);
    }

    isActive() {
        return this.active;
    }

    setActive(active) {
        this.active = active;
        if (active) {
            this.builderTabPage.classList.add('active');
            this.active = active;
        } else if (this.builderTabPage.classList.contains('active')) {
            this.builderTabPage.classList.remove('active');
        }
        
    }

    getData() {
        return {
            ...this.fieldProperties.getProperties(),
            type: this.type,
            fields: this.builderChildFields.map(f => f.getData())
        };
    }
    
    validate() {
        this.fieldProperties.validateAll(this);

        for (const field of this.builderChildFields) {
            field.validate();
        }
    }
}