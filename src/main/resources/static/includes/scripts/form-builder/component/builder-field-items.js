import { WindowFrame } from './window-frame.js';

export class BuilderFieldItems {
    constructor(label) {
        this.windowFrame = new WindowFrame(label);

        this.builderMenuUlContainer = document.createElement('ul');
        this.builderMenuUlContainer.className = '';

        this.windowFrame.setContent(this.builderMenuUlContainer);
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
        const builderPageFieldMenuItem = document.createElement('li');
        builderPageFieldMenuItem.className = 'builder-page-field-menu-item';
        builderPageFieldMenuItem.draggable = true;
        builderPageFieldMenuItem.innerHTML = label;
        builderPageFieldMenuItem.setAttribute('data-type', type);
        builderPageFieldMenuItem.setAttribute('data-label', label);

        builderPageFieldMenuItem.addEventListener("dragstart", (event) => {
            Dropzone.setDraggedItem(event.target);
        });

        this.builderMenuUlContainer.append(builderPageFieldMenuItem);
    }

    getContent() {
        return this.windowFrame.getContent();
    }
}