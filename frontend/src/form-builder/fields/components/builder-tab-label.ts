import { BuilderTabPage } from '../builder-tab-page';

export class BuilderTabLabel {
    builderTabLabelItemContainer = document.createElement('div');
    builderTabLabelItem = document.createElement('div');

    onActivateCallback: ((value: BuilderTabLabel) => void) | null = null;
    onDeleteCallback: ((value: BuilderTabLabel) => void) | null = null;

    tab: BuilderTabPage | null = null;

    constructor() {
        this.builderTabLabelItemContainer.className = 'builder-tab-label-item-container';
        this.builderTabLabelItemContainer.draggable = true;

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
            if (this.onDeleteCallback !== null) {
                this.onDeleteCallback(this);
            }
        });
        
    }

    setLabel(label: string) {
        this.builderTabLabelItem.textContent = label;
    }

    getLabel() {
        return this.builderTabLabelItem.textContent;
    }

    getContent() {
        return this.builderTabLabelItemContainer;
    }

    getTab() {
        return this.tab;
    }

    setTab(tab: BuilderTabPage) {
        this.tab = tab;
    }

    setActive(active: boolean) {
        if (active) {
            this.builderTabLabelItemContainer.classList.add('active');
            if (this.tab) {
                this.tab.setActive(true);
            }
        } else if (this.builderTabLabelItemContainer.classList.contains('active')) {
            this.builderTabLabelItemContainer.classList.remove('active');
            this.tab?.setActive(false);
        }
    }
}