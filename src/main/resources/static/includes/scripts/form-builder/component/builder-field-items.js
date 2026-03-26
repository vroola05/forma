import { WindowFrame } from './window-frame.js';
import { Dropzone } from '../fields/components/dropzone.js';

export class BuilderFieldItems {
    constructor(label) {
        this.windowFrame = new WindowFrame(label);

        this.builderFieldItems = document.createElement('ul');
        this.builderFieldItems.className = 'builder-field-items';

        this.windowFrame.setContent(this.builderFieldItems);
    }

    createItems(items) {
        for (const item of items) {
            this.createItem(item.icon, item.type, item.label)
        }
    }
    /**
     * 
     * @param {*} type 
     * @param {*} label 
     */
    createItem(icon, type, label) {
        const builderPageFieldItem = document.createElement('li');
        builderPageFieldItem.className = 'builder-page-field-item' + (icon !== '' ? ' icon ' + icon : '');
        builderPageFieldItem.draggable = true;
        builderPageFieldItem.innerHTML = label;
        builderPageFieldItem.setAttribute('data-type', type);
        builderPageFieldItem.setAttribute('data-label', label);

        builderPageFieldItem.addEventListener("dragstart", (event) => {
            Dropzone.setDraggedItem(event.target);
        });

        this.builderFieldItems.append(builderPageFieldItem);
    }

    getContent() {
        return this.windowFrame.getContent();
    }
}