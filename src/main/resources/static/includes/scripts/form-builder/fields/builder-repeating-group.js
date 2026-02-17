import { BuilderFieldInterface } from "./builder-field-interface.js";
import { Dropzone } from './components/dropzone.js';
import { EventService } from '../../shared/services/event-service.js';
import { FIELD_TYPES } from '../field-types.js'
import { Lang } from '../../shared/services/lang.js'

export class BuilderRepeatingGroup extends BuilderFieldInterface {
    dropzone = null;
    acceptedTypes = ['text', 'number', 'date', 'select', 'radio', 'valuta'];

    builderFields = [];

    onDeleteCallback = null;

    constructor(type, label) {
        super(type, label);

        this.fieldProperties.addProperties([
            {type: 'number', id: 'minSize', label: Lang.get('prop.minSize.label')},
            {type: 'number', id: 'maxSize', label: Lang.get('prop.maxSize.label')},
            {type: 'select', id: 'layout', label: Lang.get('prop.layout.label'), value: 'table', options: [
                {value: 'list', text: Lang.get('prop.layout.label.list')},
                {value: 'table', text: Lang.get('prop.layout.label.table')}
            ]}
        ]);

        this.createContent(type, label);
    }

    createContent(type, label) {
        this.builderFormGroup = document.createElement('div');
        this.builderFormGroup.className = 'builder-repeating-group draggable-item';
        this.builderFormGroup.draggable = true;
        this.builderFormGroup.setAttribute('data-type', type);
        this.builderFormGroup.addEventListener("dragstart", (event) => {
            if (this.onDragStart) {
                this.onDragStart(event);
            }   
        });

        const builderFormGroupHeaderBar = document.createElement('div');
        builderFormGroupHeaderBar.className = 'builder-repeating-group-header-bar';
        this.builderFormGroup.appendChild(builderFormGroupHeaderBar);

        this.builderFormFieldHeaderLabel = document.createElement('div');
        this.builderFormFieldHeaderLabel.className = 'builder-repeating-group-header-bar-label';
        builderFormGroupHeaderBar.appendChild(this.builderFormFieldHeaderLabel);
        this.setLabel();


        const builderFormGroupHeaderBarButtons = document.createElement('div');
        builderFormGroupHeaderBarButtons.className = 'builder-repeating-group-header-bar-buttons';
        builderFormGroupHeaderBar.appendChild(builderFormGroupHeaderBarButtons);

        const builderFormGroupBtnEdit = document.createElement('button');
        builderFormGroupBtnEdit.className = 'builder-repeating-group-btn-edit';
        builderFormGroupHeaderBarButtons.appendChild(builderFormGroupBtnEdit);
        builderFormGroupBtnEdit.addEventListener('click', (event) => {
            event.preventDefault();
            EventService.callEventListener('properties-changed', this);
        });

        const builderFormGroupBtnClose = document.createElement('button');
        builderFormGroupBtnClose.className = 'builder-repeating-group-btn-close';
        builderFormGroupHeaderBarButtons.appendChild(builderFormGroupBtnClose);
        builderFormGroupBtnClose.addEventListener('click', (event) => {
            if (this.onDeleteCallback) {
                this.onDeleteCallback(this);
            }
        });
        
        const builderFormGroupFieldContainer = document.createElement('div');
        builderFormGroupFieldContainer.className = 'builder-repeating-group-field-container';
        this.builderFormGroup.appendChild(builderFormGroupFieldContainer);

        this.builderFormGroupField = document.createElement('div');
        this.builderFormGroupField.className = 'builder-repeating-group-field';
        builderFormGroupFieldContainer.appendChild(this.builderFormGroupField);

        this.dropzone = new Dropzone(this.builderFormGroupField, this.builderFields, 
            (type, label, dragged, droppedOnformItem) => {
                this.updateFormGroup();
            }, 
            (type, label, dragged, droppedOnformItem) => {
                this.updateFormGroup();
            },
            () => {
                this.updateFormGroup();
            }).setAcceptedTypes(this.acceptedTypes);
    }

    setLabel(value) {
        if (value) {
            this.builderFormFieldHeaderLabel.innerHTML = `${this.label} - (${value})`;
        } else {
            this.builderFormFieldHeaderLabel.innerHTML = `${this.label}`;
        }
    }

    getContent() {
        return this.builderFormGroup;
    }

    init(properties) {
        if (properties) {
            this.initDefaultProperties(properties);

            for (const field of properties.fields) {
                
                if (field.type in FIELD_TYPES) {
                    const f = this.dropzone.addItem(field.type, FIELD_TYPES[field.type]);
                    f.init(field);
                }
                
                
            }

        }
    }

    updateFormGroup() {
        EventService.callEventListener('field-changed', this);
    }

    getData() {
        return {
            ...this.fieldProperties.getProperties(), 
            type: this.type,
            fields: this.builderFields.map(f => f.getData())
        };
    }

    validate() {
        if (this.fieldProperties.properties) {
            
            try {
                this.fieldProperties.validateAll(this);
            } catch (e) {
                throw new Error(`${this.fieldProperties.getFieldIdentifier()} - ${e.message}`);
            }

            let minSize = this.fieldProperties.getPropertyValueById('minSize');
            let maxSize = this.fieldProperties.getPropertyValueById('maxSize');
            if (minSize !== null && isNaN(minSize)) {
                throw new Error(`${this.fieldProperties.getFieldIdentifier()} - Minimaal aantal rijen moet een geldig getal zijn.`);
            }
            if (maxSize !== null && isNaN(maxSize)) {
                throw new Error(`${this.fieldProperties.getFieldIdentifier()} - Maximaal aantal rijen moet een geldig getal zijn.`);
            }

            if (minSize !== null && maxSize !== null && minSize > maxSize) {
                throw new Error(`${this.fieldProperties.getFieldIdentifier()} - Het veld Minimaal aantal rijen (${minSize}) mag niet groter zijn dan maximaal aantal rijen (${maxSize}).`);
            }
        }

        for (const field of this.builderFields) {
            field.validate();
        }
    }
}