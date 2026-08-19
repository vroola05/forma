import { BaseFieldDto } from "../../shared/model/types";
import { EventService } from '../../shared/services/event-service';
import { Lang } from '../../shared/services/lang';
import { BuilderPropertiesService } from '../services/builder-properties-service';
import { FIELD_TYPE, PROPERTY_TYPE } from '../types';
import { BuilderFieldInterface } from "./builder-field-interface";
import { Dropzone } from './components/dropzone';

export class BuilderRepeatingGroup extends BuilderFieldInterface {
    builderFormGroup = document.createElement('div');
    builderFormFieldHeaderLabel = document.createElement('div');
    builderFormGroupField = document.createElement('div');

    dropzone: Dropzone | null = null;

    acceptedTypes = ['text', 'number', 'date', 'select', 'radio', 'valuta'];

    fields: BuilderFieldInterface[] = [];

    onDeleteCallback: ((field: BuilderFieldInterface) => void) | null = null;

    constructor(type: FIELD_TYPE, label: string) {
        super(type, label);

        this.fieldProperties.addProperties([
            {type: PROPERTY_TYPE.NUMBER, id: 'minLength', label: Lang.get('prop.minSize.label')},
            {type: PROPERTY_TYPE.NUMBER, id: 'maxLength', label: Lang.get('prop.maxSize.label')},
            {type: PROPERTY_TYPE.SELECT, id: 'layout', label: Lang.get('prop.layout.label'), value: 'table', options: [
                {value: 'default', text: Lang.get('prop.layout.label.default')},
                {value: 'table', text: Lang.get('prop.layout.label.table')}
            ]}
        ]);

        this.createContent(type, label);
    }

    createContent(type: FIELD_TYPE, label: string) {
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

        this.builderFormFieldHeaderLabel.className = 'builder-repeating-group-header-bar-label';
        builderFormGroupHeaderBar.appendChild(this.builderFormFieldHeaderLabel);
        this.setLabel();


        const builderFormGroupHeaderBarButtons = document.createElement('div');
        builderFormGroupHeaderBarButtons.className = 'builder-repeating-group-header-bar-buttons';
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
        builderFormGroupFieldContainer.className = 'builder-repeating-group-field-container';
        this.builderFormGroup.appendChild(builderFormGroupFieldContainer);

        this.builderFormGroupField.className = 'builder-repeating-group-field';
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
                if (field.type in FIELD_TYPE) {
                    const f = this.dropzone?.addNewItem(Dropzone.getType(field.type), field.type);
                    if (f) {
                        f.init(field);
                    }
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
        if (this.fieldProperties.properties) {
            
            try {
                this.fieldProperties.validateAll(this);
            } catch (error) {
                if ( error instanceof Error) {
                    throw new Error(`${this.fieldProperties.getFieldIdentifier()} - ${error.message}`, { cause: error });
                } else {
                    throw new Error(`${this.fieldProperties.getFieldIdentifier()} - ${error}`, { cause: error });
                }
            }

            const minLength = this.fieldProperties.getPropertyValueById('minLength');
            const maxLength = this.fieldProperties.getPropertyValueById('maxLength');
            if (minLength !== null && isNaN(minLength)) {
                throw new Error(`${this.fieldProperties.getFieldIdentifier()} - Minimaal aantal rijen moet een geldig getal zijn.`);
            }
            if (maxLength !== null && isNaN(maxLength)) {
                throw new Error(`${this.fieldProperties.getFieldIdentifier()} - Maximaal aantal rijen moet een geldig getal zijn.`);
            }

            if (minLength !== null && maxLength !== null && minLength > maxLength) {
                throw new Error(`${this.fieldProperties.getFieldIdentifier()} - Het veld Minimaal aantal rijen (${minLength}) mag niet groter zijn dan maximaal aantal rijen (${maxLength}).`);
            }
        }

        for (const field of this.fields) {
            field.validate();
        }
    }
}