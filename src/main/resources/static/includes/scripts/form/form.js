import { FormGroup } from './form-group.js';

import { TabLabel } from './tab-label.js';
import { Tab } from './tab.js';

export class Form {
    fields = [];

    constructor(form) {
        this.template = sessionStorage.getItem('template');
        this.name = form.name;
        this.label = form.label;
        this.classes = form.classes;
        this.metadata = form.metadata || [];
        this.summaryConfirmation = form.summaryConfirmation || [];
        this.createElement();

        form.tabs.forEach(tabData => {
            this.createTab(tabData);
        });
    }

    /**
     * 
     */
    createElement() {
        this.content = document.createElement('div');
        this.content.className = `form-container ${this.classes}`;
        
        const tabNavContainer = document.createElement('nav');
        tabNavContainer.className = `tab-nav-container `;
        this.content.appendChild(tabNavContainer);

        this.tabNavInnerContainer = document.createElement('div');
        this.tabNavInnerContainer.className = `tab-nav-inner-container`;
        tabNavContainer.appendChild(this.tabNavInnerContainer);

        this.tabContentContainer = document.createElement('div');
        this.tabContentContainer.className = `tab-content-container`;
        this.content.appendChild(this.tabContentContainer);
    }

    /**
     * 
     * @param {*} name 
     * @param {*} label 
     * @param {*} formGroups 
     */
    createTab(tabData) {
        const tab = new Tab(tabData, (tabName) => {
            this.setTab(tabName);
        });
        
        this.tabNavInnerContainer.append(tab.getTabLabel().getContent());
        this.tabContentContainer.append(tab.getContent());

        this.fields.push(tab);

        return tab;
    }

    setTabPrevious() {
        const fields = this.getFieldsShow();
        const activeIndex = fields.findIndex(item => item.isActive());
        if (activeIndex > 0) {
            this.setTab(fields[activeIndex - 1].getName());
        }
    }

    setTabNext() {
        const fields = this.getFieldsShow();
        const activeIndex = fields.findIndex(item => item.isActive());
        if (activeIndex >= 0 && fields.length - 1) {
            this.setTab(fields[activeIndex + 1].getName());
            
        }
    }

    /**
     * 
     * @param {*} tabName 
     */
    setTab(tabName) {
        let isValid = true;
        let tabFound = false;
        const length = this.fields.length;
        for (const i in this.fields) {
            const tab = this.fields[i];
            if (tab.getName() !== tabName && isValid && !tabFound) {
                isValid = tab.validate();
                this.setTabActive(tab, !isValid, i, length);
            } else if (isValid && tab.getName() === tabName) {
                tabFound = true;
                this.setTabActive(tab, isValid, i, length);
            } else {
                this.setTabActive(tab, false, i, length);
            }
        };
    }

    setTabActive(tabObject, active, index, size) {
        if (active) {
            tabObject.setActive(true);
            if (this.onTabChange) {
                this.onTabChange(tabObject, index, size);
            }
        } else {
            tabObject.setActive(false);
        }
    }

    /**
     * 
     * @param {*} onTabChange 
     */
    setOnTabChange(onTabChange){
        this.onTabChange = onTabChange;
    }

    /**
     * 
     * @returns 
     */
    getContent() {
        return this.content;
    }

    /**
     * 
     * @returns 
     */
    validate() {
        console.log('Validating form');
        for(const tabObject of this.fields) {
            if (!tabObject.validate()) {
                return false;
            }
        }
        return true;
    }

    validateTab(tab) {
        console.log('Validating tab:', tab.name);
        for (const formGroup of tab.formGroups) {
            if (!formGroup.validate()) {
                return false;
            }
        }
        return true;
    }

    /**
     * 
     * @returns 
     */
    getValues() {
        const values = {};
        this.fields.forEach(tab => {
            tab.formGroups.forEach(group => {
                values[group.name] = group.getValue();
            });
        });
        return values;
    }

    setMetadata(metadata) {
        if (metadata) {
            for(const m of metadata) {
                this.metadata.set(m, m);
            }
        }
        return this;
    }

    hasMetadata(metadata) {
        return this.metadata.size == 0 || this.metadata.has(metadata);
    }

    getFieldsShow() {
        return this.fields.filter(fields => fields.show);
    }

    getFields() {
        return this.fields;
    }
}