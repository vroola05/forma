import { BuilderFormGroup } from '../builder-form-group.js';
import { BuilderField, BuilderFieldOptions } from '../builder-field.js';
import { BuilderRepeatingGroup } from '../builder-repeating-group.js';
import { EventService } from '../../../shared/services/event-service.js';
import { Lang } from '../../../shared/services/lang.js';

/**
 * The dropzone can be used to create a droppable area for builder-components
 */
export class Dropzone {
    static currentDraggedDom = null;
    static currentDraggedItem = null;

    acceptedTypes = [];
    domElement = null;

    /**
     * 
     * @param {*} domElement - the dom element the drop event is attached to
     * @param {*} objectArray - an array of Field elements 
     * @param {*} onAddCallback 
     * @param {*} onMoveCallback 
     * @param {*} onPropertiesChangedCallback 
     */
    constructor(field, domElement, onAddCallback, onMoveCallback, onPropertiesChangedCallback) {
        this.field = field;

        this.domElement = domElement;

        this.onAddCallback = onAddCallback;
        this.onMoveCallback = onMoveCallback;
        this.onPropertiesChangedCallback = onPropertiesChangedCallback;

        this.domElement.classList.add('dropzone');

        this.domElement.addEventListener("dragover", (event) => {
            event.preventDefault();

            this.domElement.classList.add('drag-over');

            const fieldDraggable = event.target.closest('.draggable-item');
            if (fieldDraggable) {
                fieldDraggable.classList.add('drag-item');
            }
        });

        this.domElement.addEventListener('dragleave', (event) => {
            event.preventDefault();

            this.domElement.classList.remove('drag-over');

            const fieldDraggable = event.target.closest('.draggable-item');
            if (fieldDraggable) {
                fieldDraggable.classList.remove('drag-item');
            }
        });

        this.domElement.addEventListener("drop", (event) => {
            event.preventDefault();
            event.stopPropagation();
            this.onDrop(event);
        });
    }

    onDrop(event) {
        this.domElement.classList.remove('drag-over');

        if (Dropzone.currentDraggedDom == null) {
            return;
        }

        // Check if the dropzone is the correct one
        if (!event.currentTarget.classList.contains("dropzone")) {
            return
        }

        // It is posible that the drop event is fired by a child element, 
        // so we need to check if the dropzone is the target or one of its children
        const dropzone = event.target.closest('.dropzone')
        if (this.domElement != dropzone) {
            return;
        }

        let droppedOnformItem = event.target.closest('.draggable-item');
        if (droppedOnformItem && !dropzone.contains(droppedOnformItem)) {
            droppedOnformItem = null;
        }

        if (droppedOnformItem) {
            droppedOnformItem.classList.remove('drag-item');
        }

        const type = Dropzone.currentDraggedDom.dataset.type;
        if (!this.isAcceptedTypes(type)) {
            return;
        }

        // 
        if (Dropzone.currentDraggedDom.classList.contains('builder-page-field-item')) {
            this.addNewItem(type, Dropzone.currentDraggedDom.dataset.label, droppedOnformItem);
        }

        // 
        if (Dropzone.currentDraggedDom.classList.contains('draggable-item')) {
            this.changeExistingItem(type, droppedOnformItem);
        }

        // 
        this.currentDraggedDom = null;
    }

    /**
     * Move an element that is already in a Dropzone. Ik can be this dropzone but also an other dropzone
     * @param {*} type 
     * @param {*} droppedDom 
     * @returns 
     */
    changeExistingItem(type, droppedDom) {
        const builderChildFields = this.field.getFields();
        if (builderChildFields != null) {

            if (Dropzone.currentDraggedDom === droppedDom) {
                return;
            }

            const draggedIndex = builderChildFields.findIndex(bf => bf.getContent() === Dropzone.currentDraggedDom);
            // Cant't find element in current Dropzone
            if (draggedIndex === -1) {
                this.moveToOtherDropzone(droppedDom, Dropzone.currentDraggedItem);
                return;
            } else {
                this.moveInCurrentDropzone(draggedIndex, droppedDom);
            }
        }

        this.onMoveCallback(type, Dropzone.currentDraggedDom.dataset.label, Dropzone.currentDraggedDom, droppedDom);
    }

    moveToOtherDropzone(droppedDom, draggedItem) {
        if (!draggedItem) {
            return;
        }

        const draggedIndex = draggedItem.getParent().getFields().findIndex(bf => bf.getContent() === Dropzone.currentDraggedDom);
        // const draggedIndex = draggedItem.getParent().objectArray.findIndex(bf => bf.getContent() === Dropzone.currentDraggedDom);
        if (draggedIndex === -1) {
            return;
        }

        draggedItem.getParent().getFields().splice(draggedIndex, 1);
        draggedItem.getParent().dropzone.draw();
        // draggedItem.getParent().objectArray.splice(draggedIndex, 1);
        // draggedItem.getParent().draw();

        draggedItem.setParent(this.field);
        this.bindFieldEvents(draggedItem);
        const builderChildFields = this.field.getFields();
        if (droppedDom == null) {
            builderChildFields.push(draggedItem);
        } else {
            const droppedIndex = builderChildFields.findIndex(bf => bf.getContent() === droppedDom);
            builderChildFields.splice(droppedIndex, 0, draggedItem);
        }
        this.draw();
    }

    moveInCurrentDropzone(draggedIndex, droppedDom) {
        const builderChildFields = this.field.getFields();
        if (droppedDom == null) {
            const [draggedItem] = builderChildFields.splice(draggedIndex, 1);
            builderChildFields.push(draggedItem);
        } else {
            const draggedItem = builderChildFields[draggedIndex];
            const droppedIndex = builderChildFields.findIndex(bf => bf.getContent() === droppedDom);

            builderChildFields.splice(draggedIndex, 1);
            builderChildFields.splice(droppedIndex, 0, draggedItem);
        }

        this.draw();
    }

    getUniqueName(label, property = 'name', cleanLabel = false, seperator = '-') {
        let baseLabel = cleanLabel
            ? label.toLowerCase().trim().replace(/\s+/g, '-')
            : label;

        const existingNames = this.field.getFields().map(f => f.getPropertyValueById(property));

        let index = 1;
        let newName = `${baseLabel}${seperator}${index}`;

        while (existingNames.includes(newName)) {
            index++;
            newName = `${baseLabel}${seperator}${index}`;
        }

        return newName;
    }

    addNewItem(type, label, droppedOnformItem) {
        const field = this.getField(type);
        field.setPropertyValueById('name', this.getUniqueName(field.getLabel(), 'name', true));
        field.setPropertyValueById('label', this.getUniqueName(field.getLabel(), 'label', false, ' '));

        this.bindFieldEvents(field);

        const builderChildFields = this.field.getFields();

        if (droppedOnformItem == null) {
            this.domElement.appendChild(field.getContent());
            builderChildFields.push(field);
        } else {
            const bfIndex = builderChildFields.findIndex(bf => bf.getContent() === droppedOnformItem);
            if (bfIndex === -1) return;

            builderChildFields.splice(bfIndex, 0, field);
            this.domElement.insertBefore(field.getContent(), droppedOnformItem);
        }

        this.onAddCallback(type, label, this.currentDraggedDom, droppedOnformItem);
        return field;
    }

    bindFieldEvents(field) {

        field.onDragStart = (event) => {
            event.stopPropagation();

            const currentDraggedItem = this.field.getFields().find(bf => bf.getContent() === event.target);
            Dropzone.setDraggedItem(event.target, currentDraggedItem);
        };

        field.onFieldChanged = (properties) => {
            if (this.onPropertiesChangedCallback) {
                this.onPropertiesChangedCallback(properties);
            }
        };
        field.onDeleteCallback = (field) => {
            const builderChildFields = this.field.getFields();
            const index = builderChildFields.findIndex(bf => bf === field);
            if (index !== -1) {
                builderChildFields.splice(index, 1);
                this.domElement.removeChild(field.getContent());
                EventService.emit('field-deleted', this);
            }
        }
    }

    getField(type) {
        switch (type) {
            case 'form-group':
                return new BuilderFormGroup(type, Lang.get('field.type.form.group'))
                    .setParent(this.field);
            case 'text':
                return new BuilderField(type, Lang.get('field.type.text'))
                    .setParent(this.field);
            case 'number':
                return new BuilderField(type, Lang.get('field.type.number'))
                    .setParent(this.field);
            case 'valuta':
                return new BuilderField(type, Lang.get('field.type.valuta'))
                    .setParent(this.field);
            case 'date':
                return new BuilderField(type, Lang.get('field.type.date'))
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
            case 'repeating-group':
                return new BuilderRepeatingGroup(type, Lang.get('field.type.repeating.group'))
                    .setParent(this.field);
        }
        throw new Error('Onbekend type: ' + type);
    }

    static setDraggedItem(draggedDomElement, draggedDomItem = null) {
        Dropzone.currentDraggedDom = draggedDomElement;
        Dropzone.currentDraggedItem = draggedDomItem;

        return this;
    }

    setAcceptedTypes(types) {
        this.acceptedTypes = types;
        return this;
    }

    isAcceptedTypes(type) {
        return !this.acceptedTypes || this.acceptedTypes.length == 0 ? true : this.acceptedTypes.includes(type);
    }

    draw() {
        this.domElement.ionnerHTML = '';
        this.field.getFields().forEach(bf => {
            this.domElement.appendChild(bf.getContent());
        });
    }
}