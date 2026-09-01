import { EventService } from '../../../shared/services/event-service';
import { Lang } from '../../../shared/services/lang';
import { FIELD_TYPE } from '../../types';
import { BuilderForm } from '../builder-form';
import { BuilderTabPage } from '../builder-tab-page';
import { BuilderTabLabel } from './builder-tab-label';

export class BuilderTabComponent {
    builderTab = document.createElement('div');
    builderTabLabelContainer = document.createElement('div');
    builderTabLabelBtnLeft = document.createElement('div');
    builderTabLabelBtnTabContainer = document.createElement('div');
    builderTabLabelBtnTabContainerInner = document.createElement('div');
    builderTabLabelBtnRight = document.createElement('div');

    builderFormTabs = document.createElement('div');

    onActivateCallback: ((tabLabel: BuilderTabLabel) => void) | null = null;
    onCreateCallback: ((tabLabel: BuilderTabPage) => void) | null = null;
    onDeleteCallback: ((tabLabel: BuilderTabLabel) => void) | null = null;

    onMoveCallback: (() => void) | null = null;

    builderForm: BuilderForm;
    draggedItem: HTMLElement | null = null;

    tabs: BuilderTabPage[] = [];

    constructor(builderForm: BuilderForm) {
        this.builderForm = builderForm

        this.builderTab.className = 'builder-tab';

        this.builderTab.append(this.builderTabLabelContainer, this.builderFormTabs);

        this.builderTabLabelContainer.className = 'builder-tab-label-container';

        this.builderTabLabelBtnLeft.className = 'builder-btn-icon builder-tab-label-btn icon icon-chevron-left';
        this.builderTabLabelContainer.appendChild(this.builderTabLabelBtnLeft);
        this.builderTabLabelBtnLeft.addEventListener('click', () => {
            if (!this.builderTabLabelBtnLeft.classList.contains('disabled')) {
            this.moveScrollbar(false);
            }
        });

        this.builderTabLabelBtnTabContainer.className = 'builder-tab-label-btn-tab-container';
        this.builderTabLabelContainer.appendChild(this.builderTabLabelBtnTabContainer);

        this.builderTabLabelBtnTabContainerInner.className = 'builder-tab-label-btn-tab-container-inner';
        this.builderTabLabelBtnTabContainer.appendChild(this.builderTabLabelBtnTabContainerInner);

        this.builderTabLabelBtnTabContainer.addEventListener("dragover", (event) => {
            event.preventDefault();
            this.builderTabLabelBtnTabContainer.classList.add('drag-over');
        });

        this.builderTabLabelBtnTabContainer.addEventListener('dragleave', (event) => {
            event.preventDefault();
            this.builderTabLabelBtnTabContainer.classList.remove('drag-over');
        });

        this.builderTabLabelBtnTabContainer.addEventListener("drop", (event) => {
            event.preventDefault();

            this.builderTabLabelBtnTabContainer.classList.remove('drag-over');
            if (this.draggedItem === null) {
                return;
            }
            if (!this.draggedItem.classList.contains('builder-tab-label-item-container')) {
                return;
            }

            const target = event.target as Element;
            let droppedItem = target.closest('.builder-tab-label-item-container');
            if (droppedItem && !this.builderTabLabelBtnTabContainerInner.contains(droppedItem)) {
                droppedItem = null;
            }

            this.moveItem(this.draggedItem, droppedItem as HTMLElement);

            this.draggedItem = null;
        });

        const resizeObserver = new ResizeObserver((entries) => {
            const outerRect = this.builderTabLabelBtnTabContainer.getBoundingClientRect();
            const innerRect = this.builderTabLabelBtnTabContainerInner.getBoundingClientRect();

            if (outerRect.width < innerRect.width) {
                // this.focusTab(this.tabLabel);
            }
        });

        resizeObserver.observe(this.builderTabLabelBtnTabContainer);

        const builderTabLabelBtnAdd = document.createElement('div');
        builderTabLabelBtnAdd.className = 'builder-btn-icon builder-tab-label-btn icon icon-plus-lg';
        this.builderTabLabelContainer.appendChild(builderTabLabelBtnAdd);
        builderTabLabelBtnAdd.addEventListener('click', () => {
            this.createTab();
        });

        this.builderTabLabelBtnRight.className = 'builder-btn-icon builder-tab-label-btn icon icon-chevron-right';
        this.builderTabLabelContainer.appendChild(this.builderTabLabelBtnRight);
        this.builderTabLabelBtnRight.addEventListener('click', () => {
            if (!this.builderTabLabelBtnRight.classList.contains('disabled')) {
                this.moveScrollbar(true);
            }
        });

        const builderFormTabContainer = document.createElement('div');
        builderFormTabContainer.className = 'builder-form-tab-container';
        this.builderTab.appendChild(builderFormTabContainer);

        const builderFormTabContainerInner = document.createElement('div');
        builderFormTabContainerInner.className = 'builder-form-tab-container-inner';
        builderFormTabContainer.appendChild(builderFormTabContainerInner);

        this.builderFormTabs.className = 'builder-form-tab';
        builderFormTabContainerInner.appendChild(this.builderFormTabs);
    }

    moveItem(draggedDomItem: HTMLElement, droppedDomItem: HTMLElement | null = null) {
        const list = Array.from(this.builderTabLabelBtnTabContainerInner.children);
        if (draggedDomItem === droppedDomItem) return;

        const draggedIndex = list.findIndex(tabLabel => tabLabel === draggedDomItem);
        let droppedIndex = null;
        
        if (droppedDomItem === null) {
            this.builderTabLabelBtnTabContainerInner.appendChild(draggedDomItem);
        } else {
            droppedIndex = list.findIndex(tabLabel => tabLabel === droppedDomItem);
            if (draggedIndex < droppedIndex) {
                this.builderTabLabelBtnTabContainerInner.insertBefore(draggedDomItem, droppedDomItem.nextSibling);
            } else {
                this.builderTabLabelBtnTabContainerInner.insertBefore(draggedDomItem, droppedDomItem);
            }
        }

        //////////////////
        //////////////////
        const [draggedItem] = this.tabs.splice(draggedIndex, 1);
        if (droppedIndex === null) {
            this.tabs.push(draggedItem);
        } else {
            this.tabs.splice(droppedIndex, 0, draggedItem);
        }
        //////////////////
        //////////////////

        if (this.onMoveCallback) {
            this.onMoveCallback();
        }
    }

    deleteItem(tabLabel: BuilderTabLabel) {
        const index = this.tabs.findIndex(bf => bf.getTabLabel() === tabLabel);
            
        if (index !== -1) {
            if (this.tabs.length > 1 && this.tabs[index].isActive()) {
                const newIndex = index > 0 ? index - 1 : index + 1;
                const tabLabelItem = this.tabs[newIndex].getTabLabel();
                if (tabLabelItem) {
                    this.setActive(tabLabelItem);
                }
            }

            this.tabs[index].getContent().remove();

            this.tabs.splice(index, 1);
            
            EventService.emit('field-deleted', this);
        }

        if (this.onDeleteCallback) {
            this.onDeleteCallback(tabLabel);
        }

        tabLabel.getContent().remove();
    }

    createTab() {
        const tabLabel = new BuilderTabLabel();
        tabLabel.onActivateCallback = (tabLabel) => {
            this.setActive(tabLabel);
        };

        tabLabel.onDeleteCallback = (tabLabel: BuilderTabLabel) => {
            this.deleteItem(tabLabel);
        };

        const tabLabelDom = tabLabel.getContent();
        tabLabelDom.addEventListener("dragstart", (event) => {
            this.draggedItem = event.currentTarget as HTMLElement;
        });

        this.builderTabLabelBtnTabContainerInner.appendChild(tabLabelDom);

        const tab = new BuilderTabPage(FIELD_TYPE.TAB, tabLabel.getLabel());
        this.tabs.push(tab);
        tab.setParent(this.builderForm);
        tabLabel.setTab(tab);
        tab.setTabLabelItem(tabLabel);

        tab.setPropertyValueById('name', this.builderForm.getUniqueName(Lang.get('tab.new'), 'name', true));

        const label = this.builderForm.getUniqueLabel(Lang.get('tab.new'));
        tab.setDefaultLabel(label);
        tabLabel.setLabel(label);

        this.builderFormTabs.appendChild(tab.getContent());
        this.setActive(tabLabel);
        
        if (this.onCreateCallback !== null) {
            this.onCreateCallback(tab);
        }

        return tabLabel.getTab();
    }

    setActive(tabLabel: BuilderTabLabel) {
        this.focusTab(tabLabel);
    
        for (const builderField of this.tabs) {
            const tabLabelItem = builderField.getTabLabel();
            if (!tabLabelItem)
                return;

            
            if (builderField.getTabLabel() === tabLabel) {
                tabLabelItem.setActive(true);
            } else {
                tabLabelItem.setActive(false);
            }
        }

        if (this.onActivateCallback !== null) {
            this.onActivateCallback(tabLabel);
        }
    }

    focusTab(tabLabel: BuilderTabLabel | null) {
        if (!tabLabel) {
            return;
        }

        const containerWidth = this.builderTabLabelBtnTabContainer.getBoundingClientRect().width;
        const tabLabelContent = tabLabel.getContent();
        
        const length =  this.getTabPositionInWidth(tabLabelContent);
        if (length[1]  > containerWidth + this.builderTabLabelBtnTabContainer.scrollLeft) {
            this.builderTabLabelBtnTabContainer.scrollLeft = length[1] - containerWidth;
        }

        if (length[0]  < this.builderTabLabelBtnTabContainer.scrollLeft) {
            this.builderTabLabelBtnTabContainer.scrollLeft = length[0];
        }

        this.setScrollButtons();
    }

    setScrollButtons() {
        if (this.builderTabLabelBtnTabContainer.scrollLeft <= 4) {
            this.builderTabLabelBtnLeft.classList.add('disabled');
        } else {
            this.builderTabLabelBtnLeft.classList.remove('disabled');
        }
        
        if (this.builderTabLabelBtnTabContainer.getBoundingClientRect().width >= this.builderTabLabelBtnTabContainerInner.getBoundingClientRect().width - this.builderTabLabelBtnTabContainer.scrollLeft-4) {
            this.builderTabLabelBtnRight.classList.add('disabled');
        } else {
            this.builderTabLabelBtnRight.classList.remove('disabled');
        }
    }

    getTabPositionInWidth(tabLabelContent: HTMLElement) {
        let totalWith = 0;
        for (const child of this.builderTabLabelBtnTabContainerInner.children) {
            const childWidth = child.getBoundingClientRect().width;
            
            if (tabLabelContent === child) {
                return [totalWith, totalWith+childWidth];
            }

            totalWith += childWidth;
        }
        return [0,0];
    }

    moveScrollbar(right: boolean) {
        const outerRect = this.builderTabLabelBtnTabContainer.getBoundingClientRect();
        const innerRect = this.builderTabLabelBtnTabContainerInner.getBoundingClientRect();
        const scrollWithCurrent = this.builderTabLabelBtnTabContainer.scrollLeft;

        let scrollWith = 0;
        if (outerRect.width < innerRect.width) {
            for (const child of this.builderTabLabelBtnTabContainerInner.children) {
                const childWidth = child.getBoundingClientRect().width;
                if (scrollWith+childWidth > scrollWithCurrent) {
                    this.builderTabLabelBtnTabContainer.scrollLeft = right ? scrollWith + childWidth : scrollWith - childWidth;
                    this.setScrollButtons();
                    return;
                } else {
                    scrollWith += childWidth;
                }
            };
        }
    }

    getTabs() {
        return this.tabs;
    }

    getContent() {
        return this.builderTab;

    }
}