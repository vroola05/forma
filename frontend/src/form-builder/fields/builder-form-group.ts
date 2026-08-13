import { BaseFieldDto } from "../../shared/model/types";
import { EventService } from '../../shared/services/event-service';
import { BuilderPropertiesService } from '../services/builder-properties-service';
import { FIELD_TYPE } from '../types';
import { BuilderFieldInterface } from "./builder-field-interface";
import { Dropzone } from './components/dropzone';

export class BuilderFormGroup extends BuilderFieldInterface {
    builderFormGroup = document.createElement('div');
    builderFormFieldHeaderLabel = document.createElement('div');
    builderFormGroupField = document.createElement('div');

    dropzone: Dropzone | null = null;

    acceptedTypes = [
        'text',
        'checkbox',
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

    fields: BuilderFieldInterface[] = [];

    onDeleteCallback: ((field: BuilderFieldInterface) => void) | null = null;

    constructor(type: FIELD_TYPE, label: string) {
        super(type, label);
        this.createContent(type, label);
    }

    createContent(type: FIELD_TYPE, label: string) {
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
            BuilderPropertiesService.set(this);
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

    setLabel(value: string | undefined = undefined) {
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

    init(baseFieldDto: BaseFieldDto) {

        if (baseFieldDto) {
            this.initDefaultProperties(baseFieldDto);

            if (!baseFieldDto.fields) {
                return;
            }
            for (const field of baseFieldDto.fields) {
                
                try {
                    Dropzone.getType(field.type)
                    const f = this.dropzone?.addNewItem(Dropzone.getType(field.type), field.type);
                    if (f) {
                        f.init(field);
                    }
                } catch (error) {
                    console.error('Error initializing field in form group', error);
                }
            }
        }
    }
    
    updateFormGroup() {
        EventService.emit('field-changed', this);
    }

    getData(): any {
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