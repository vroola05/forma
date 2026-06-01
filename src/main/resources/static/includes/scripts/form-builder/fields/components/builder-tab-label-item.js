import {Lang} from '../../../shared/services/lang.js';

export class BuilderTabLabelItem {
    onActivateCallback = null;
    tabPage = null;

    constructor(tabAmount) {

        this.builderTabLabelItemContainer = document.createElement('div');
        this.builderTabLabelItemContainer.className = 'builder-tab-label-item-container';
        this.builderTabLabelItemContainer.draggable = true;

        this.builderTabLabelItem = document.createElement('div');
        this.builderTabLabelItem.className = 'builder-tab-label-item';
        // this.builderTabLabelItem.textContent = Lang.get('tab.new') + tabAmount;
        this.builderTabLabelItem.addEventListener('click', (event) => {
            if (this.onActivateCallback) {
                this.onActivateCallback(this);
            }
        });
        this.builderTabLabelItemContainer.appendChild(this.builderTabLabelItem);

        const builderTabLabelItemBtnClose = document.createElement('div');
        builderTabLabelItemBtnClose.className = 'builder-btn-icon builder-tab-label-item-btn-close icon icon-x-lg';
        this.builderTabLabelItemContainer.appendChild(builderTabLabelItemBtnClose);

        builderTabLabelItemBtnClose.addEventListener('click', (event) => {
            if (this.onDeleteCallback != null) {
                this.onDeleteCallback(this);
            }
        });
        
    }

    setLabel(label) {
        this.builderTabLabelItem.textContent = label != undefined ? label : 'Nieuwe tab ' + tabAmount;
    }

    getLabel() {
        return this.builderTabLabelItem.textContent;
    }

    getContent() {
        return this.builderTabLabelItemContainer;
    }

    getTabPage() {
        return this.tabPage;
    }

    setTabPage(tabPage) {
        this.tabPage = tabPage;
    }

    setTabProperties(properties) {
        // this.tabPage.fieldProperties.
    }

    setActive(active) {
        if (active) {
            this.builderTabLabelItemContainer.classList.add('active');
            if (this.tabPage) {
                this.tabPage.setActive(true);
            }
        } else if (this.builderTabLabelItemContainer.classList.contains('active')) {
            this.builderTabLabelItemContainer.classList.remove('active');
            this.tabPage.setActive(false);
        }
    }
}