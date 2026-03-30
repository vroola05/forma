import { BuilderFieldInterface } from "../fields/builder-field-interface.js";
import { Dropzone } from './components/dropzone.js';
import { EventService } from '../../shared/services/event-service.js';
import { Lang } from '../../shared/services/lang.js';

export class BuilderTabPage extends BuilderFieldInterface {
    dropzone = null;
    acceptedTypes = ['form-group', 'text', 'number', 'date', 'select', 'radio', 'valuta', 'repeating-group'];
    tabLabelItem = null;
    active = false;

    builderFields = [];

    constructor(type, label) {
        super(type, label);
        this.createContent(type, label);
    }

    init(properties) {
        if (properties) {
            this.initDefaultProperties(properties);

            for (const formGroup of properties.fields) {
                const field = this.dropzone.addItem('form-group', Lang.get('field.type.form.group'));
                field.init(formGroup);
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
            EventService.callEventListener('properties-changed', this);
        });

        const builderTabPagesContainer = document.createElement('div');
        builderTabPagesContainer.className = 'builder-tab-pages-container';
        this.builderTabPage.appendChild(builderTabPagesContainer);

        this.builderTabPages = document.createElement('div');
        this.builderTabPages.className = 'builder-tab-pages';
        builderTabPagesContainer.appendChild(this.builderTabPages);

        this.dropzone = new Dropzone(
            this.builderTabPages,
            this.builderFields, 
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

    getContent() {
        return this.builderTabPage;
    }

    updateTabPage() {
        EventService.callEventListener('field-changed', this);
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
            fields: this.builderFields.map(f => f.getData())
        };
    }
    
    validate() {
        this.fieldProperties.validateAll(this);

        for (const formGroup of this.builderFields) {
            formGroup.validate();
        }
    }
}