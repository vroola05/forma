import { WindowFrame } from '../../../component/window-frame';
import { Dropzone } from '../../../fields/components/dropzone';
import { FIELD_TYPE } from '../../../types';

export class BuilderFieldItems {
    builderFieldItems: HTMLElement = document.createElement('ul');

    windowFrame: WindowFrame;

    constructor(label: string) {
        this.windowFrame = new WindowFrame(label);

        this.builderFieldItems.className = 'builder-field-items';

        this.windowFrame.setContent(this.builderFieldItems);
    }

    createItems(items: {icon: string, type: FIELD_TYPE, label: string}[]) {
        for (const item of items) {
            this.createItem(item.icon, item.type, item.label)
        }
    }
    /**
     * 
     * @param {*} type 
     * @param {*} label 
     */
    createItem(icon: string, type: FIELD_TYPE, label: string) {
        const builderPageFieldItem = document.createElement('li');
        builderPageFieldItem.className = 'builder-page-field-item' + (icon !== '' ? ' icon ' + icon : '');
        builderPageFieldItem.draggable = true;
        builderPageFieldItem.innerHTML = label;
        builderPageFieldItem.setAttribute('data-type', type);
        builderPageFieldItem.setAttribute('data-label', label);

        builderPageFieldItem.addEventListener("dragstart", (event) => {
            Dropzone.setDraggedItem(event.target as HTMLElement);
        });

        this.builderFieldItems.append(builderPageFieldItem);
    }

    getContent() {
        return this.windowFrame.getContent();
    }
}