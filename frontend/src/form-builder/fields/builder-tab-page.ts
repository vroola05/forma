import { BuilderFieldInterface } from "./builder-field-interface";
import { Dropzone } from './components/dropzone';
import { EventService } from '../../shared/services/event-service';
import { BuilderPropertiesService } from '../services/builder-properties-service';
import { FIELD_TYPE } from '../types';
import { BaseFieldDto } from "../../shared/model/types";
import { BuilderTabLabel } from "./components/builder-tab-label";


export class BuilderTabPage extends BuilderFieldInterface {
    builderTabPage = document.createElement('div');
    builderTabPageHeaderBarLabel = document.createElement('div');
    builderTabPages = document.createElement('div');

    dropzone: Dropzone | null = null;

    acceptedTypes = [
        'form-group',
        'checkbox', 
        'text',
        'number',
        'date',
        'select',
        'radio',
        'valuta',
        'password',
        'label',
        'hidden',
        'file',
        'dual-listbox',
        'color',
        'repeating-group'
    ];
    tabLabelItem: BuilderTabLabel | null = null;
    active = false;

    fields: BuilderFieldInterface[] = [];

    constructor(type: FIELD_TYPE, label: string) {
        super(type, label);
        this.createContent(type, label);
    }

    init(baseFieldDto: BaseFieldDto) {
        if (baseFieldDto) {
            this.initDefaultProperties(baseFieldDto);

            if (!baseFieldDto.fields) {
                return;
            }
            
            for (const field of baseFieldDto.fields) {
                const f = this.dropzone?.addNewItem(Dropzone.getType(field.type), field.type);
                if (f) {
                    f.init(field);
                }
                
            }
        }
    }

    createContent(type: FIELD_TYPE, label: string) {
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
            BuilderPropertiesService.set(this);
        });

        const builderTabPagesContainer = document.createElement('div');
        builderTabPagesContainer.className = 'builder-tab-pages-container';
        this.builderTabPage.appendChild(builderTabPagesContainer);

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
            () => {
                this.updateTabPage();
            }).setAcceptedTypes(this.acceptedTypes);
    }

    getTabLabel(): BuilderTabLabel | null {
        return this.tabLabelItem;
    }

    setTabLabelItem(tabLabelItem: BuilderTabLabel) {
        this.tabLabelItem = tabLabelItem;
    }

    setLabel(value: string) {
        if (value) {
            this.label = value;
        }
        this.tabLabelItem?.setLabel(value);
    }

    getFields() {
        return this.fields;
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

    setActive(active: boolean) {
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
            fields: this.fields.map(f => f.getData())
        };
    }
    
    validate() {
        this.fieldProperties.validateAll(this);

        for (const field of this.fields) {
            field.validate();
        }
    }
}