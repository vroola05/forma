import { Tab } from './tab.js';
import { FormRenderer } from '../../form-viewer/components/form-renderer.js';
export class Form {
    fields = [];

    constructor(form, state) {
        
        this.name = form.name;
        this.label = form?.label;
        this.type = form.type;
        this.id = form.id;
        this.singlePage = !form.singlePage ? false : form.singlePage;
        console.log('c', this.singlePage);
        this.classes = !form?.classes ? '' : form?.classes;
        this.metadata = form?.metadata || [];
        this.confirmation = form?.confirmation || [];

        this.createElement();

        const tabState = state?.fields;
        form.fields.forEach(tabData => {
            this.createTab(tabData, tabState?.[tabData.name]);
        });

        this.createConfirmations(form);
        

        if (this.singlePage) {
            this.setTab();
        }
    }

    /**
     * On the summary page it is posible to have confirmation checkboxes.
     * 
     * @param {*} form 
     */
    createConfirmations(form) {
        if (!form?.confirmationCheck) {
            return;
        }
        this.confirmationCheck = [];
        for (const f of form?.confirmationCheck) {
            const confirmation = FormRenderer.createField(f);
            confirmation.setId(confirmation.getName());
            confirmation.setLayout('layout-column');
            this.confirmationCheck.push(confirmation);

        }
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

        if (!this.singlePage) {
            this.tabNavInnerContainer = document.createElement('div');
            this.tabNavInnerContainer.className = `tab-nav-inner-container`;
            tabNavContainer.appendChild(this.tabNavInnerContainer);
        }
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
    createTab(tabData, state) {
        const tab = new Tab(tabData, state, (tabName) => {
            this.setTab(tabName);
        });
        
        
        if (!this.singlePage) {
            this.tabNavInnerContainer.append(tab.getTabLabel().getContent());
        }
        

        this.tabContentContainer.append(tab.getContent());

        this.fields.push(tab);

        return tab;
    }

    setTabPrevious() {
        const fields = this.getVisibleFields();
        const activeIndex = fields.findIndex(item => item.isActive());
        if (activeIndex > 0) {
            this.setTab(fields[activeIndex - 1].getName());
        }
    }

    setTabNext() {
        const fields = this.getVisibleFields();
        const activeIndex = fields.findIndex(item => item.isActive());
        if (activeIndex >= 0 && fields.length - 1) {
            this.setTab(fields[activeIndex + 1].getName());
        }
    }

    /**
     * 
     * @param {*} tabName 
     */
    setTab(tabName = undefined) {
        let isValid = true;
        let tabFound = false;
        const length = this.fields.length;
        for (const i in this.fields) {
            const tab = this.fields[i];
            if (this.singlePage) {
                tab.setActive(true);
            } else { 
                if (tab.getName() !== tabName && isValid && !tabFound) {
                    isValid = tab.validate();
                    this.setTabActive(tab, !isValid, i, length);
                } else if (isValid && tab.getName() === tabName) {
                    tabFound = true;
                    this.setTabActive(tab, isValid, i, length);
                } else {
                    this.setTabActive(tab, false, i, length);
                }
            }
        };

        return this;
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
        for(const tab of this.fields) {
            if (!tab.validate()) {
                return false;
            }
        }

        if (this.confirmationCheck) {
            for(const field of this.confirmationCheck) {
                if (!field.validate()) {
                    return false;
                }
            }
        }
        return true;
    }

    validateTab(tab) {
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

    getConfirmationCheck() {
        return this.confirmationCheck;
    }

    hasMetadata(metadata) {
        return this.metadata.size == 0 || this.metadata.has(metadata);
    }

    getVisibleFields() {
        return this.fields.filter(fields => fields.getShow());
    }

    getTabField(tab, name) {
        const tabPage = this.fields.find(f => f.name === tab);
        if (!tabPage) {
            return;
        }
        return tabPage.fields.find(f => f.name === name);
    }

    getField(tab) {
        return this.fields.find(f => f.name === tab);
    }

    getFields() {
        return this.fields;
    }
}