import { BuilderFieldInterface } from "./builder-field-interface";
import { BuilderPropertiesService } from '../services/builder-properties-service';
import { Lang } from '../../shared/services/lang'
import { FIELD_TYPE, PROPERTY_TYPE } from "../types";
import { BaseFieldDto } from "../../shared/model/types";

export class BuilderFieldBase extends BuilderFieldInterface {
    builderField = document.createElement('div');
    builderFormFieldHeaderLabel = document.createElement('div');

    onDeleteCallback: ((field: BuilderFieldInterface) => void) | null = null;

    constructor(type: FIELD_TYPE, label: string) {
        super(type, label);
        this.createContent(type, label);
    }

    createContent(type: FIELD_TYPE, label: string) {
        this.builderField.className = 'builder-field draggable-item';
        this.builderField.draggable = true;
        this.builderField.setAttribute('data-type', type);
        this.builderField.addEventListener("dragstart", (event: DragEvent) => {
            if (this.onDragStart) {
                this.onDragStart(event);
            }   
        });

        const builderFieldHeaderBar = document.createElement('div');
        builderFieldHeaderBar.className = 'builder-field-header-bar';
        this.builderField.appendChild(builderFieldHeaderBar);

        this.builderFormFieldHeaderLabel.className = 'builder-field-header-bar-label';
        builderFieldHeaderBar.appendChild(this.builderFormFieldHeaderLabel);
        this.setLabel();

        const builderFieldHeaderBarButtons = document.createElement('div');
        builderFieldHeaderBarButtons.className = 'builder-field-header-bar-buttons';
        builderFieldHeaderBar.appendChild(builderFieldHeaderBarButtons);

        const formItemProperties = document.createElement('button');
        formItemProperties.className = 'builder-btn-icon icon icon-three-dots-vertical';
        builderFieldHeaderBarButtons.appendChild(formItemProperties);
        formItemProperties.addEventListener('click', (event) => {
            event.preventDefault();
            BuilderPropertiesService.set(this);
        });

        const formItemClose = document.createElement('button');
        formItemClose.className = 'builder-btn-icon icon icon-x-lg';
        builderFieldHeaderBarButtons.appendChild(formItemClose);
        formItemClose.addEventListener('click', (event) => {
            if (this.onDeleteCallback) {
                this.onDeleteCallback(this);
            }
        });
    }

    setLabel(value: string | undefined = undefined) {
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

    init(baseFieldDto: BaseFieldDto) {
        if (baseFieldDto) {
            this.initDefaultProperties(baseFieldDto);
        }
    }

    validate() {
        this.fieldProperties.validateAll(this);
    }
}

export class BuilderField extends BuilderFieldBase {
    constructor(type: FIELD_TYPE, label: string) {
        super(type, label);

        this.fieldProperties.addProperties([
            {type: PROPERTY_TYPE.STRING, id: 'placeholder', order: 4, label: Lang.get('prop.placeholder.label'), value: ''},
            {type: PROPERTY_TYPE.STRING, id: 'value', order: 6, label: Lang.get('prop.value.label'), value: ''},
            {type: PROPERTY_TYPE.BOOLEAN, id: 'required', order: 7, label: Lang.get('prop.required.label'), value: false},
            {type: PROPERTY_TYPE.BOOLEAN, id: 'readonly', order: 8, label: Lang.get('prop.readonly.label'), value: false}
        ]);
    }
}

export class BuilderFieldFile extends BuilderField {
    constructor(type: FIELD_TYPE, label: string) {
        super(type, label);

        this.fieldProperties.addProperties([
            {type: PROPERTY_TYPE.BOOLEAN, id: 'isMultiple', order: 7, label: Lang.get('prop.multiple.files.label'), value: false},
            {type: PROPERTY_TYPE.NUMBER, id: 'maxFiles', order: 8, label: Lang.get('prop.multiple.files.label'), value: '5'},
            {type: PROPERTY_TYPE.NUMBER, id: 'maxFileSize', order: 9, label: Lang.get('prop.max.file.size.label'), value: ''},
            {type: PROPERTY_TYPE.LIST, id: 'allowedExtensions', order: 10, label: Lang.get('prop.allowed.extensions.label'), value: []}
        ]);
    }
}

export class BuilderFieldText extends BuilderField {
    constructor(type: FIELD_TYPE, label: string) {
        super(type, label);

        this.fieldProperties.addProperties([
            {type: PROPERTY_TYPE.NUMBER, id: 'minLength', order: 9, label: Lang.get('prop.minLength.label'), value: ''},
            {type: PROPERTY_TYPE.NUMBER, id: 'maxLength', order: 10, label: Lang.get('prop.maxLength.label'), value: ''}
        ]);
    }
}

export class BuilderFieldLabel extends BuilderFieldBase {
    constructor(type: FIELD_TYPE, label: string) {
        super(type, label);

        this.fieldProperties.addProperties([
            {type: PROPERTY_TYPE.STRING, id: 'placeholder', order: 4, label: Lang.get('prop.placeholder.label'), value: ''},
            {type: PROPERTY_TYPE.STRING, id: 'value', order: 6, label: Lang.get('prop.value.label'), value: ''},
        ]);
    }
}

export class BuilderFieldHidden extends BuilderFieldBase {
    constructor(type: FIELD_TYPE, label: string) {
        super(type, label);

        this.fieldProperties.addProperties([
             {type: PROPERTY_TYPE.STRING, id: 'value', order: 6, label: Lang.get('prop.value.label'), value: ''},
        ]);
    }
}

export class BuilderFieldOptions extends BuilderField {
    constructor(type: FIELD_TYPE, label: string) {
        super(type, label);

        this.fieldProperties.addProperties([
            {type: PROPERTY_TYPE.OPTIONS, id: 'options', order: 6,  label: Lang.get('prop.options.label'), value: []},
        ]);
    }
}