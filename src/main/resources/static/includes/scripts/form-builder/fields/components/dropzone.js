import { BuilderFormGroup } from '../builder-form-group.js';
import { BuilderField, BuilderFieldOptions } from '../builder-field.js';
import { BuilderRepeatingGroup } from '../builder-repeating-group.js';
import { EventService } from '../../../shared/services/event-service.js';
import { Lang } from '../../../shared/services/lang.js';

export class Dropzone {
    static currentDraggedDom = null;
    static currentDraggedItem = null;

    acceptedTypes = [];
    domElement = null;
    objectArray = null;

    constructor(domElement, objectArray, onAddCallback, onMoveCallback, onPropertiesChangedCallback) {
        this.objectArray = objectArray;
        this.domElement = domElement;

        this.onAddCallback = onAddCallback;
        this.onMoveCallback = onMoveCallback;
        this.onPropertiesChangedCallback = onPropertiesChangedCallback;

        this.domElement.classList.add('dropzone');

        this.domElement.addEventListener("dragover", (event) => {
            event.preventDefault();
            
            this.domElement.classList.add('drag-over');

            const field = event.target.closest('.draggable-item');
            if (field) {
                field.classList.add('drag-item');
            }
        });

        this.domElement.addEventListener('dragleave', (event) => {
            event.preventDefault();

            this.domElement.classList.remove('drag-over');

            const field = event.target.closest('.draggable-item');
            if (field) {
                field.classList.remove('drag-item');
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

    changeExistingItem(type, droppedDom) {
        if (this.objectArray != null) {
            if (Dropzone.currentDraggedDom === droppedDom) {
                return;
            }

            const draggedIndex = this.objectArray.findIndex(bf => bf.getContent() === Dropzone.currentDraggedDom);
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
        
        const draggedIndex = draggedItem.getParent().objectArray.findIndex(bf => bf.getContent() === Dropzone.currentDraggedDom);
        if (draggedIndex === -1) {
            return;
        }

        draggedItem.getParent().objectArray.splice(draggedIndex, 1);
        draggedItem.getParent().draw();

        draggedItem.setParent(this);
        this.bindFieldEvents(draggedItem);
        if (droppedDom == null) {
            this.objectArray.push(draggedItem);
        } else {
            const droppedIndex = this.objectArray.findIndex(bf => bf.getContent() === droppedDom);
            this.objectArray.splice(droppedIndex, 0, draggedItem);
        }
        this.draw();
    }

    moveInCurrentDropzone(draggedIndex, droppedDom) {
        if (droppedDom == null) {
            const [draggedItem] = this.objectArray.splice(draggedIndex, 1);
            this.objectArray.push(draggedItem);
        } else {
            const draggedItem = this.objectArray[draggedIndex];
            const droppedIndex = this.objectArray.findIndex(bf => bf.getContent() === droppedDom);

            this.objectArray.splice(draggedIndex, 1);
            this.objectArray.splice(droppedIndex, 0, draggedItem);
        }

        this.draw();
    }

    addNewItem(type, label, droppedOnformItem) {
        const field = this.getField(type);
        this.bindFieldEvents(field);

        if (droppedOnformItem == null) {
            this.domElement.appendChild(field.getContent());
            this.objectArray.push(field);
        } else {
            const bfIndex = this.objectArray.findIndex(bf => bf.getContent() === droppedOnformItem);
            if (bfIndex === -1) return;

            this.objectArray.splice(bfIndex, 0, field);
            this.domElement.insertBefore(field.getContent(), droppedOnformItem);
        }

        this.onAddCallback(type, label, this.currentDraggedDom, droppedOnformItem);
        EventService.callEventListener('properties-changed', field);
        return field;
    }

    bindFieldEvents(field) {
        field.onDragStart = (event) => {
            event.stopPropagation();
            const currentDraggedItem = this.objectArray.find(bf => bf.getContent() === event.target);
            Dropzone.setDraggedItem(event.target, currentDraggedItem);
        };

        field.onFieldChanged = (properties) => {
            if (this.onPropertiesChangedCallback) {
                this.onPropertiesChangedCallback(properties);
            }
        };
        field.onDeleteCallback = (field) => {
            const index = this.objectArray.findIndex(bf => bf === field);
            if (index !== -1) {
                this.objectArray.splice(index, 1);
                this.domElement.removeChild(field.getContent());
                EventService.callEventListener('field-deleted', this);
            }
        }
    }

    getField(type) {
        switch(type) {
            case 'form-group':
                return new BuilderFormGroup(type, Lang.get('field.type.form.group'))
                    .setParent(this);
            case 'text':
                return new BuilderField(type, Lang.get('field.type.text'))
                    .setParent(this);
            case 'number':
                return new BuilderField(type, Lang.get('field.type.number'))
                    .setParent(this);
            case 'valuta':
                return new BuilderField(type, Lang.get('field.type.valuta'))
                    .setParent(this);
            case 'date':
                return new BuilderField(type, Lang.get('field.type.date'))
                    .setParent(this);
            case 'select':
                return new BuilderFieldOptions(type, Lang.get('field.type.select'))
                    .setParent(this);
            case 'checkbox':
                return new BuilderFieldOptions(type, Lang.get('field.type.checkbox'))
                    .setParent(this);
            case 'radio':
                return new BuilderFieldOptions(type, Lang.get('field.type.radio'))
                    .setParent(this);
            case 'repeating-group':
                return new BuilderRepeatingGroup(type, Lang.get('field.type.repeating.group'))
                    .setParent(this);
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
        this.objectArray.forEach(bf => {
            this.domElement.appendChild(bf.getContent());
        });
    }
}