import {BuilderTabLabelItem} from './builder-tab-label-item.js';

export class BuilderTabLabel {
    onActivateCallback = null;
    onCreateCallback = null;
    onDeleteCallback = null;
    onMoveCallback = null;

    tabLabelItem = null;

    draggedItem = null;

    constructor() {
        this.builderTabLabelContainer = document.createElement('div');
        this.builderTabLabelContainer.className = 'builder-tab-label-container';

        this.builderTabLabelBtnLeft = document.createElement('div');
        this.builderTabLabelBtnLeft.className = 'builder-btn-icon builder-tab-label-btn icon icon-chevron-left';
        this.builderTabLabelContainer.appendChild(this.builderTabLabelBtnLeft);
        this.builderTabLabelBtnLeft.addEventListener('click', () => {
            if (!this.builderTabLabelBtnLeft.classList.contains('disabled')) {
            this.moveScrollbar(false);
            }
        });

        this.builderTabLabelBtnTabContainer = document.createElement('div');
        this.builderTabLabelBtnTabContainer.className = 'builder-tab-label-btn-tab-container';
        this.builderTabLabelContainer.appendChild(this.builderTabLabelBtnTabContainer);

        this.builderTabLabelBtnTabContainerInner = document.createElement('div');
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
            if (this.draggedItem == null) {
                return;
            }
            if (!this.draggedItem.classList.contains('builder-tab-label-item-container')) {
                return;
            }

            let droppedItem = event.target.closest('.builder-tab-label-item-container');
            if (droppedItem && !this.builderTabLabelBtnTabContainerInner.contains(droppedItem)) {
                droppedItem = null;
            }

            this.moveItem(this.draggedItem, droppedItem);

            this.draggedItem = null;
        });

        const resizeObserver = new ResizeObserver((entries) => {
            let outerRect = this.builderTabLabelBtnTabContainer.getBoundingClientRect();
            let innerRect = this.builderTabLabelBtnTabContainerInner.getBoundingClientRect();

            if (outerRect.width < innerRect.width) {
                this.focusTab(this.tabLabelItem);
            }
        });

        resizeObserver.observe(this.builderTabLabelBtnTabContainer);

        const builderTabLabelBtnAdd = document.createElement('div');
        builderTabLabelBtnAdd.className = 'builder-btn-icon builder-tab-label-btn icon icon-plus-lg';
        this.builderTabLabelContainer.appendChild(builderTabLabelBtnAdd);
        builderTabLabelBtnAdd.addEventListener('click', () => {
            const tab = this.createTab();
            
            
        });

        this.builderTabLabelBtnRight = document.createElement('div');
        this.builderTabLabelBtnRight.className = 'builder-btn-icon builder-tab-label-btn icon icon-chevron-right';
        this.builderTabLabelContainer.appendChild(this.builderTabLabelBtnRight);
        this.builderTabLabelBtnRight.addEventListener('click', () => {
            if (!this.builderTabLabelBtnRight.classList.contains('disabled')) {
                this.moveScrollbar(true);
            }
        });
    }

    moveItem(draggedItem, droppedItem) {
        const list = Array.from(this.builderTabLabelBtnTabContainerInner.children);
        if (draggedItem === droppedItem) return;

        let draggedIndex = list
                .findIndex(tabLabel => tabLabel === draggedItem);
        let droppedIndex = null;
        
        if (droppedItem == null) {
            this.builderTabLabelBtnTabContainerInner.appendChild(draggedItem);
        } else {
            droppedIndex = list
                    .findIndex(tabLabel => tabLabel === droppedItem);
                    if (draggedIndex < droppedIndex) {
                        this.builderTabLabelBtnTabContainerInner.insertBefore(draggedItem, droppedItem.nextSibling);
                    } else {
                        this.builderTabLabelBtnTabContainerInner.insertBefore(draggedItem, droppedItem);
                    }
            
        }

        if (this.onMoveCallback) {
            this.onMoveCallback(draggedIndex, droppedIndex);
        }
        
    }

    deleteItem(tabLabelItem) {
        if (this.onDeleteCallback) {
            this.onDeleteCallback(tabLabelItem);
        }

        this.builderTabLabelBtnTabContainerInner.removeChild(tabLabelItem.getContent());
    }

    createTab() {
        
        const tabLabelItemDoms = Array.from(this.builderTabLabelBtnTabContainerInner.children);

        const tabLabelItem = new BuilderTabLabelItem(tabLabelItemDoms.length + 1);
        tabLabelItem.onActivateCallback = (tabLabelItem) => {
            this.setActive(tabLabelItem);
        };

        tabLabelItem.onDeleteCallback = (tabLabelItem) => {
            this.deleteItem(tabLabelItem);
        };

        const tabLabelItemDom = tabLabelItem.getContent();
        tabLabelItemDom.addEventListener("dragstart", (event) => {
            this.draggedItem = event.currentTarget;
        });

        this.builderTabLabelBtnTabContainerInner.appendChild(tabLabelItemDom);

        if (this.onCreateCallback != null) {
            this.onCreateCallback(tabLabelItem);
        }

        return tabLabelItem.getTabPage();
        
    }

    setActive(tabLabelItem) {
        this.tabLabelItem = tabLabelItem;
        this.focusTab(tabLabelItem);

        // const tabLabelItemDoms = Array.from(this.builderTabLabelBtnTabContainerInner.children);
        // for (const child of tabLabelItemDoms) {
        //     if (tabLabelItem == child) {
        //         child.setActive(true);
        //     } else {
        //         child.setActive(false);
        //     }
        // }

        if (this.onActivateCallback != null) {
            this.onActivateCallback(tabLabelItem);
        }
    }

    focusTab(tabLabelItem) {
        let containerWidth = this.builderTabLabelBtnTabContainer.getBoundingClientRect().width;
        const tabLabelItemContent = tabLabelItem.getContent();
        
        const length =  this.getTabPositionInWidth(tabLabelItemContent);
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

    getTabPositionInWidth(tab) {
        let totalWith = 0;
        for (const child of this.builderTabLabelBtnTabContainerInner.children) {
            const childWidth = child.getBoundingClientRect().width;
            
            if (tab == child) {
                return [totalWith, totalWith+childWidth];
            }

            totalWith+=childWidth;
        }
        return [0,0];
    }

    moveScrollbar(right) {
        let outerRect = this.builderTabLabelBtnTabContainer.getBoundingClientRect();
        let innerRect = this.builderTabLabelBtnTabContainerInner.getBoundingClientRect();
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

    getContent() {
        return this.builderTabLabelContainer;
    }
}