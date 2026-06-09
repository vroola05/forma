import { BuilderFieldInterface } from "./builder-field-interface.js";
import { Dropzone } from './components/dropzone.js';
import { EventService } from '../../shared/services/event-service.js';
import { FIELD_TYPES } from '../field-types.js'

export class BuilderFormGroup extends BuilderFieldInterface {
    dropzone = null;
    acceptedTypes = ['text', 'number', 'date', 'select', 'radio', 'valuta', 'repeating-group'];

    fields = [];

    onDeleteCallback = null;

    constructor(type, label) {
        super(type, label);
        this.createContent(type, label);
    }

    createContent(type, label) {
        this.builderFormGroup = document.createElement('div');
        this.builderFormGroup.className = 'builder-form-group draggable-item';
        this.builderFormGroup.draggable = true;
        this.builderFormGroup.setAttribute('data-type', type);
        this.builderFormGroup.addEventListener("dragstart", (event) => {
            if (this.onDragStart) {
                this.onDragStart(event);
            }   
        });

        const builderFormGroupHeaderBar = document.createElement('div');
        builderFormGroupHeaderBar.className = 'builder-form-group-header-bar';
        this.builderFormGroup.appendChild(builderFormGroupHeaderBar);

        this.builderFormFieldHeaderLabel = document.createElement('div');
        this.builderFormFieldHeaderLabel.className = 'builder-form-group-header-bar-label';
        builderFormGroupHeaderBar.appendChild(this.builderFormFieldHeaderLabel);
        this.setLabel();


        const builderFormGroupHeaderBarButtons = document.createElement('div');
        builderFormGroupHeaderBarButtons.className = 'builder-form-group-header-bar-buttons';
        builderFormGroupHeaderBar.appendChild(builderFormGroupHeaderBarButtons);

        const builderFormGroupBtnEdit = document.createElement('button');
        builderFormGroupBtnEdit.className = 'builder-btn-icon icon icon-three-dots-vertical';
        builderFormGroupHeaderBarButtons.appendChild(builderFormGroupBtnEdit);
        builderFormGroupBtnEdit.addEventListener('click', (event) => {
            event.preventDefault();
            EventService.emit('properties-changed', this);
        });

        const builderFormGroupBtnClose = document.createElement('button');
        builderFormGroupBtnClose.className = 'builder-btn-icon icon icon-x-lg';
        builderFormGroupHeaderBarButtons.appendChild(builderFormGroupBtnClose);
        builderFormGroupBtnClose.addEventListener('click', (event) => {
            if (this.onDeleteCallback) {
                this.onDeleteCallback(this);
            }
        });
        
        const builderFormGroupFieldContainer = document.createElement('div');
        builderFormGroupFieldContainer.className = 'builder-form-group-field-container';
        this.builderFormGroup.appendChild(builderFormGroupFieldContainer);

        this.builderFormGroupField = document.createElement('div');
        this.builderFormGroupField.className = 'builder-form-group-field';
        builderFormGroupFieldContainer.appendChild(this.builderFormGroupField);

        this.dropzone = new Dropzone(this, this.builderFormGroupField, 
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

    getFields() {
        return this.fields;
    }

    getContent() {
        return this.builderFormGroup;
    }

    init(properties) {
        if (properties) {
            this.initDefaultProperties(properties);

            for (const field of properties.fields) {
                if (field.type in FIELD_TYPES) {
                    const f = this.dropzone.addNewItem(field.type, FIELD_TYPES[field.type]);
                    f.init(field);
                }
            }
        }
    }

    updateFormGroup() {
        EventService.emit('field-changed', this);
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