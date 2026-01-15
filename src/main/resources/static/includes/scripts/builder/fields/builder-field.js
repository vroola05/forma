import { BuilderFieldInterface } from "./builder-field-interface.js";
import { EventService } from '../../services/event-service.js';
import { Lang } from '../../util/lang.js'

export class BuilderField extends BuilderFieldInterface {
    onDeleteCallback = null;

    constructor(type, label) {
        super(type, label);
        this.createContent(type, label);

        this.fieldProperties.addProperties([
            {type: 'string', id: 'placeholder', label: Lang.get('prop.placeholder.label'), value: ''},
            {type: 'boolean', id: 'readonly', label: Lang.get('prop.readonly.label'), value: false},
            {type: 'boolean', id: 'required', label: Lang.get('prop.required.label'), value: false},
            {type: 'number', id: 'minLength', label: Lang.get('prop.minLength.label'), value: ''},
            {type: 'number', id: 'maxLength', label: Lang.get('prop.maxLength.label'), value: ''},
            {type: 'string', id: 'value', label: Lang.get('prop.value.label'), value: ''}

        ]);
    }

    createContent(type, label) {
        this.builderField = document.createElement('div');
        this.builderField.className = 'builder-field draggable-item';
        this.builderField.draggable = true;
        this.builderField.setAttribute('data-type', type);
        this.builderField.addEventListener("dragstart", (event) => {
            if (this.onDragStart) {
                this.onDragStart(event);
            }   
        });

        const builderFieldHeaderBar = document.createElement('div');
        builderFieldHeaderBar.className = 'builder-field-header-bar';
        this.builderField.appendChild(builderFieldHeaderBar);

        this.builderFormFieldHeaderLabel = document.createElement('div');
        this.builderFormFieldHeaderLabel.className = 'builder-field-header-bar-label';
        builderFieldHeaderBar.appendChild(this.builderFormFieldHeaderLabel);
        this.setLabel();

        const builderFieldHeaderBarButtons = document.createElement('div');
        builderFieldHeaderBarButtons.className = 'builder-field-header-bar-buttons';
        builderFieldHeaderBar.appendChild(builderFieldHeaderBarButtons);

        const formItemProperties = document.createElement('button');
        formItemProperties.className = 'builder-field-btn-edit';
        builderFieldHeaderBarButtons.appendChild(formItemProperties);
        formItemProperties.addEventListener('click', (event) => {
            event.preventDefault();
            EventService.getInstance().callEventListener('properties-changed', this);
        });

        const formItemClose = document.createElement('button');
        formItemClose.className = 'builder-field-btn-close';
        builderFieldHeaderBarButtons.appendChild(formItemClose);
        formItemClose.addEventListener('click', (event) => {
            if (this.onDeleteCallback) {
                this.onDeleteCallback(this);
            }
        });
    }

    setLabel(value) {
        if (value) {
            this.builderFormFieldHeaderLabel.innerHTML = `${this.label} - (${value})`;
        } else {
            this.builderFormFieldHeaderLabel.innerHTML = `${this.label}`;
        }
    }

    getContent() {
        return this.builderField;
    }


    getData() {
        return {
            ...this.fieldProperties.getProperties(),
            type: this.type
        };
    }

    init(properties) {
        if (properties) {
            this.initDefaultProperties(properties);
        }
    }

    validate() {
        this.fieldProperties.validateAll(this);
    }
}

export class BuilderFieldOptions extends BuilderField {
    constructor(type, label) {
        super(type, label);

        this.fieldProperties.addProperties([
            {type: 'options', id: 'options', label: Lang.get('prop.options.label'), value: []},
        ]);
    }
}