import { EventService } from '../../../shared/services/event-service';
import { Lang } from '../../../shared/services/lang';
import { FIELD_TYPE } from '../../types';
import { BuilderField, BuilderFieldFile, BuilderFieldHidden, BuilderFieldLabel, BuilderFieldOptions, BuilderFieldText } from '../builder-field';
import { BuilderFieldInterface } from '../builder-field-interface';
import { BuilderFormGroup } from '../builder-form-group';
import { BuilderRepeatingGroup } from '../builder-repeating-group';

export type DropzoneEvent = (type: FIELD_TYPE, label: string | undefined, dragged: HTMLElement | null, droppedOnFormItem: HTMLElement | null) => void;
/**
 * The dropzone can be used to create a droppable area for builder-components
 */
export class Dropzone {
    static currentDraggedDom: HTMLElement | null = null;
    static currentDraggedItem: BuilderFieldInterface | null = null;

    field: BuilderFieldInterface;

    onAddCallback: DropzoneEvent;
    onMoveCallback?: DropzoneEvent;
    onPropertiesChangedCallback: () => void;

    acceptedTypes: string[] = [];
    domElement: HTMLElement;

    /**
     * 
     * @param {*} domElement - the dom element the drop event is attached to
     * @param {*} objectArray - an array of Field elements 
     * @param {*} onAddCallback 
     * @param {*} onMoveCallback 
     * @param {*} onPropertiesChangedCallback 
     */
    constructor(field: BuilderFieldInterface, domElement: HTMLElement, onAddCallback: DropzoneEvent, onMoveCallback: DropzoneEvent, onPropertiesChangedCallback: () => void) {
        this.field = field;

        this.domElement = domElement;

        this.onAddCallback = onAddCallback;
        this.onMoveCallback = onMoveCallback;
        this.onPropertiesChangedCallback = onPropertiesChangedCallback;

        this.domElement.classList.add('dropzone');

        this.domElement.addEventListener("dragover", (event: DragEvent) => {
            event.preventDefault();

            this.domElement.classList.add('drag-over');

            if (event.target instanceof Element) {
                const fieldDraggable = event?.target?.closest('.draggable-item');
                if (fieldDraggable) {
                    fieldDraggable.classList.add('drag-item');
                }
            }
        });

        this.domElement.addEventListener('dragleave', (event) => {
            event.preventDefault();

            this.domElement.classList.remove('drag-over');

            if (event.target instanceof Element) {
                const fieldDraggable = event.target.closest('.draggable-item');
                if (fieldDraggable) {
                    fieldDraggable.classList.remove('drag-item');
                }
            }
        });

        this.domElement.addEventListener("drop", (event: DragEvent) => {
            event.preventDefault();
            event.stopPropagation();
            this.onDrop(event);
        });
    }

    onDrop(event: DragEvent) {
        this.domElement.classList.remove('drag-over');

        if (Dropzone.currentDraggedDom === null) {
            return;
        }

        // Check if the dropzone is the correct one
        if (event.currentTarget instanceof Element && !event.currentTarget.classList.contains("dropzone")) {
            return
        }

        if (!(event.target instanceof Element)) {
            return;
        }

        // It is posible that the drop event is fired by a child element, 
        // so we need to check if the dropzone is the target or one of its children
        const dropzone = event.target.closest('.dropzone')
        if (this.domElement !== dropzone) {
            return;
        }

        let droppedOnFormItem = event.target.closest('.draggable-item') as HTMLElement | null;
        if (droppedOnFormItem && !dropzone.contains(droppedOnFormItem)) {
            droppedOnFormItem = null;
        }

        if (droppedOnFormItem) {
            droppedOnFormItem.classList.remove('drag-item');
        }

        const type = Dropzone.getType(Dropzone.currentDraggedDom.dataset.type);
        if (!this.isAcceptedTypes(type)) {
            console.error(type, 'not allowed')
            return;
        }

        // 
        if (Dropzone.currentDraggedDom && Dropzone.currentDraggedDom.classList.contains('builder-page-field-item')) {
            const label = Dropzone?.currentDraggedDom?.dataset?.label;
            this.addNewItem(type, label ? label : '', droppedOnFormItem);
        }

        // 
        if (Dropzone.currentDraggedDom.classList.contains('draggable-item')) {
            this.changeExistingItem(type, droppedOnFormItem);
        }

        // 
        Dropzone.currentDraggedDom = null;
    }

    static getType(type: string | undefined): FIELD_TYPE {
        const isValidType = Object.values(FIELD_TYPE).includes(type as any);
        if (isValidType) {
            return type as FIELD_TYPE;
        }
        throw new Error();
    }
    
    /**
     * Move an element that is already in a Dropzone. Ik can be this dropzone but also an other dropzone
     * @param {*} type 
     * @param {*} droppedDom 
     * @returns 
     */
    changeExistingItem(type: FIELD_TYPE, droppedDom: HTMLElement | null) {
        const builderChildFields = this.field.getFields();
        if (builderChildFields !== null) {
            if (Dropzone.currentDraggedDom === droppedDom) {
                return;
            }

            const draggedIndex = builderChildFields.findIndex(bf => bf.getContent() === Dropzone.currentDraggedDom);
            // Cant't find element in current Dropzone
            if (draggedIndex === -1) {
                this.moveToOtherDropzone(droppedDom, Dropzone.currentDraggedItem);

            } else {
                this.moveInCurrentDropzone(draggedIndex, droppedDom);
            }
        }

        if (this.onMoveCallback) {
            this.onMoveCallback(type, Dropzone?.currentDraggedDom?.dataset?.label, Dropzone.currentDraggedDom, droppedDom);
        }
    }

    moveToOtherDropzone(droppedDom: HTMLElement | null, draggedItem: BuilderFieldInterface | null) {
        if (!draggedItem) {
            return;
        }

        
        const draggedIndex = draggedItem?.getParent()?.getFields()?.findIndex(bf => bf.getContent() === Dropzone.currentDraggedDom);
        if (draggedIndex === undefined || draggedIndex === -1) {
            return;
        }


        draggedItem?.getParent()?.getFields()?.splice(draggedIndex, 1);
        draggedItem?.getParent()?.getDropZone()?.draw();

        draggedItem.setParent(this.field);
        this.bindFieldEvents(draggedItem);
        const builderChildFields = this.field.getFields();
        if (builderChildFields) {
            if (droppedDom === null) {
                builderChildFields.push(draggedItem);
            } else {
                const droppedIndex = builderChildFields.findIndex(bf => bf.getContent() === droppedDom);
                builderChildFields.splice(droppedIndex, 0, draggedItem);
            }
        }
        this.draw();
    }

    moveInCurrentDropzone(draggedIndex: number, droppedDom: HTMLElement | null) {
        const builderChildFields = this.field.getFields();
        if (builderChildFields) {
            if (droppedDom === null) {
                const [draggedItem] = builderChildFields.splice(draggedIndex, 1);
                builderChildFields.push(draggedItem);
            } else {
                const draggedItem = builderChildFields[draggedIndex];
                const droppedIndex = builderChildFields.findIndex(bf => bf.getContent() === droppedDom);

                builderChildFields.splice(draggedIndex, 1);
                builderChildFields.splice(droppedIndex, 0, draggedItem);
            }
        }
        this.draw();
    }

    getUniqueName(label: string, property: string = 'name', cleanLabel: boolean = false, seperator: string = '-') {
        const baseLabel = cleanLabel
            ? label.toLowerCase().trim().replace(/\s+/g, '-')
            : label;

        const existingNames = this.field?.getFields()?.map(f => f.getPropertyValueById(property));

        let index = 1;
        let newName = `${baseLabel}${seperator}${index}`;

        while (existingNames && existingNames.includes(newName)) {
            index++;
            newName = `${baseLabel}${seperator}${index}`;
        }

        return newName;
    }

    addNewItem(type: FIELD_TYPE, label: string, droppedOnFormItem: HTMLElement | null = null) {
        const field = this.getField(type);
        field.setPropertyValueById('name', this.getUniqueName(field.getLabel(), 'name', true));
        const labelNew = this.getUniqueName(field.getLabel(), 'label', false, ' ');
        field.setPropertyValueById('label', labelNew);
        field.setLabel(labelNew);
        this.bindFieldEvents(field);

        const builderChildFields = this.field.getFields();

        if (builderChildFields) {
            if (droppedOnFormItem === null) {
                this.domElement.appendChild(field.getContent());
                builderChildFields.push(field);
            } else {
                const bfIndex = builderChildFields.findIndex(bf => bf.getContent() === droppedOnFormItem);
                if (bfIndex === -1) return;

                builderChildFields.splice(bfIndex, 0, field);
                this.domElement.insertBefore(field.getContent(), droppedOnFormItem);
            }
        }

        this.onAddCallback(type, label, Dropzone.currentDraggedDom, droppedOnFormItem);
        return field;
    }

    bindFieldEvents(field: BuilderFieldInterface) {
        field.onDragStart = (event: DragEvent) => {
            event.stopPropagation();

            const currentDraggedItem = this.field?.getFields()?.find(bf => bf.getContent() === event.target);
            if (currentDraggedItem && event.target instanceof HTMLElement) {
                Dropzone.setDraggedItem(event.target, currentDraggedItem);
            }
        };

        field.onDeleteCallback = (field: BuilderFieldInterface) => {
            const builderChildFields = this.field.getFields();
            if (builderChildFields) {
                const index = builderChildFields.findIndex(bf => bf === field);
                if (index !== -1) {
                    builderChildFields.splice(index, 1);
                    const content = field.getContent();
                    if (content) {
                        this.domElement.removeChild(content);
                    }
                    EventService.emit('field-deleted', this);
                }
            }
        }
    }
 
    getField(type: FIELD_TYPE) {
        switch (type) {
            case 'form-group':
                return new BuilderFormGroup(type, Lang.get('field.type.form.group'))
                    .setParent(this.field);
            case 'text':
                return new BuilderFieldText(type, Lang.get('field.type.text'))
                    .setParent(this.field);
            case 'number':
                return new BuilderFieldText(type, Lang.get('field.type.number'))
                    .setParent(this.field);
            case 'valuta':
                return new BuilderFieldText(type, Lang.get('field.type.valuta'))
                    .setParent(this.field);
            case 'color':
                return new BuilderField(type, Lang.get('field.type.color'))
                    .setParent(this.field);
            case 'date':
                return new BuilderField(type, Lang.get('field.type.date'))
                    .setParent(this.field);


            case 'file':
                return new BuilderFieldFile(type, Lang.get('field.type.file'))
                    .setParent(this.field);
            case 'label':
                return new BuilderFieldLabel(type, Lang.get('field.type.label'))
                    .setParent(this.field);
            case 'hidden':
                return new BuilderFieldHidden(type, Lang.get('field.type.hidden'))
                    .setParent(this.field);
            case 'password':
                return new BuilderFieldText(type, Lang.get('field.type.password'))
                    .setParent(this.field);


            case 'select':
                return new BuilderFieldOptions(type, Lang.get('field.type.select'))
                    .setParent(this.field);
            case 'checkbox':
                return new BuilderFieldOptions(type, Lang.get('field.type.checkbox'))
                    .setParent(this.field);
            case 'radio':
                return new BuilderFieldOptions(type, Lang.get('field.type.radio'))
                    .setParent(this.field);
            case 'dual-listbox':
                return new BuilderFieldOptions(type, Lang.get('field.type.dual.list'))
                    .setParent(this.field);
            case 'repeating-group':
                return new BuilderRepeatingGroup(type, Lang.get('field.type.repeating.group'))
                    .setParent(this.field);
        }
        throw new Error('Onbekend type: ' + type);
    }

    static setDraggedItem(draggedDomElement: HTMLElement, draggedDomItem: BuilderFieldInterface | null = null) {
        Dropzone.currentDraggedDom = draggedDomElement;
        Dropzone.currentDraggedItem = draggedDomItem;

        return this;
    }

    setAcceptedTypes(types: string[]) {
        this.acceptedTypes = types;
        return this;
    }

    isAcceptedTypes(type: FIELD_TYPE) {
        return !this.acceptedTypes || this.acceptedTypes.length === 0 ? true : this.acceptedTypes.includes(type);
    }

    draw() {
        this.domElement.innerHTML = '';
        this.field?.getFields()?.forEach(bf => {
            const content = bf.getContent();
            if (content !== null) {
                this.domElement.appendChild(content);
            }
            
        });
    }
}