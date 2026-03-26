import { BuilderFormGroup } from '../builder-form-group.js';
import { BuilderField, BuilderFieldOptions } from '../builder-field.js';
import { BuilderRepeatingGroup } from '../builder-repeating-group.js';
import { EventService } from '../../../shared/services/event-service.js';
import { Lang } from '../../../shared/services/lang.js';

export class Dropzone {
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

        domElement.classList.add('dropzone');

        domElement.addEventListener("dragover", (event) => {
            event.preventDefault();
            
            domElement.classList.add('drag-over');

            const field = event.target.closest('.draggable-item');
            if (field) {
                field.classList.add('drag-item');
            }
        });

        domElement.addEventListener('dragleave', (event) => {
            event.preventDefault();

            domElement.classList.remove('drag-over');

            const field = event.target.closest('.draggable-item');
            if (field) {
                field.classList.remove('drag-item');
            }
        });

        domElement.addEventListener("drop", (event) => {
            event.preventDefault();

            domElement.classList.remove('drag-over');

            console.log('drop 1');
            if (Dropzone.currentDraggedItem == null) {
                return;
            }

            console.log('drop 2');
            // Check if the dropzone is the correct one
            if (!event.currentTarget.classList.contains("dropzone")) {
                return
            }

            console.log('drop 3');
            // It is posible that the drop event is fired by a child element, 
            // so we need to check if the dropzone is the target or one of its children
            const dropzone = event.target.closest('.dropzone')
            if (domElement != dropzone) {
                return;
            }

            console.log('drop 4');
            let droppedOnformItem = event.target.closest('.draggable-item');
            if (droppedOnformItem && !dropzone.contains(droppedOnformItem)) {
                droppedOnformItem = null;
            }

            if (droppedOnformItem) {
                droppedOnformItem.classList.remove('drag-item');
            }

            console.log('drop 5');
            const type = Dropzone.currentDraggedItem.dataset.type;
            if (!this.isAcceptedTypes(type)) {
                return;
            }

            console.log('drop 6');
            if (Dropzone.currentDraggedItem.classList.contains('builder-page-field-menu-item')) {
                this.addItem(type, Dropzone.currentDraggedItem.dataset.label, droppedOnformItem);
            }

            console.log('drop 7');
            if (Dropzone.currentDraggedItem.classList.contains('draggable-item')) {
                this.moveItem(type, droppedOnformItem);
            }
            this.currentDraggedItem = null
        });
    }

    moveItem(type, droppedOnformItem) {
        console.log('moveItem', type, droppedOnformItem);
        if (this.objectArray != null) {
            if (Dropzone.currentDraggedItem === droppedOnformItem) return;

            const bfOldIndex = this.objectArray.findIndex(bf => bf.getContent() === Dropzone.currentDraggedItem);
            if (bfOldIndex === -1) return;
            const [bfOld] = this.objectArray.splice(bfOldIndex, 1);

            if (droppedOnformItem == null) {
                this.objectArray.push(bfOld);
            } else {
                const bfNewIndex = this.objectArray.findIndex(bf => bf.getContent() === droppedOnformItem);
                if (bfNewIndex === -1) return;
                this.objectArray.splice(bfNewIndex, 0, bfOld);
            }
            this.domElement.ionnerHTML = '';
            this.objectArray.forEach(bf => {
                this.domElement.appendChild(bf.getContent());
            });
        }

        this.onMoveCallback(type, Dropzone.currentDraggedItem.dataset.label, Dropzone.currentDraggedItem, droppedOnformItem);
    }

    addItem(type, label, droppedOnformItem) {
        const field = this.getField(type, label);
        console.log('field', field);
        field.onDragStart = (event) => {
            Dropzone.setDraggedItem(event.target);
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

        if (droppedOnformItem == null) {
            this.domElement.appendChild(field.getContent());
            this.objectArray.push(field);
        } else {
            const bfIndex = this.objectArray.findIndex(bf => bf.getContent() === droppedOnformItem);
            if (bfIndex === -1) return;

            this.objectArray.splice(bfIndex, 0, field);
            this.domElement.insertBefore(field.getContent(), droppedOnformItem);
        }

        this.onAddCallback(type, label, this.currentDraggedItem, droppedOnformItem);
        EventService.callEventListener('properties-changed', field);
        return field;
    }

    getField(type, label) {
        switch(type) {
            case 'form-group':
                return new BuilderFormGroup(type, Lang.get('field.type.form.group'));
            case 'text':
                return new BuilderField(type, Lang.get('field.type.text'));
            case 'number':
                return new BuilderField(type, Lang.get('field.type.number'));
            case 'valuta':
                return new BuilderField(type, Lang.get('field.type.valuta'));
            case 'date':
                return new BuilderField(type, Lang.get('field.type.date'));
            case 'select':
                return new BuilderFieldOptions(type, Lang.get('field.type.select'));
            case 'checkbox':
                return new BuilderFieldOptions(type, Lang.get('field.type.checkbox'));
            case 'radio':
                return new BuilderFieldOptions(type, Lang.get('field.type.radio'));
            case 'repeating-group':
                return new BuilderRepeatingGroup(type, Lang.get('field.type.repeating.group'));
        }
        throw new Error('Onbekend type: ' + type);
    }

    static setDraggedItem(item) {
        Dropzone.currentDraggedItem = item;
        return this;
    }

    setAcceptedTypes(types) {
        this.acceptedTypes = types;
        return this;
    }

    isAcceptedTypes(type) {
        return !this.acceptedTypes || this.acceptedTypes.length == 0 ? true : this.acceptedTypes.includes(type);
    }
}