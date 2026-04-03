import { Nucleus } from './interface/nucleus.js';
import { TabLabel } from './components/tab-label.js';
import { FormRenderer } from '../../form-viewer/components/form-renderer.js';

export class Tab extends Nucleus {
    content = document.createElement('div');
    object = null;
    fields = [];
    active = false;
    tabLabel = undefined;
    onTabClick = undefined;

    constructor(tabData, state, onTabClick) {
        super(tabData.name, tabData.label);

        this.type = tabData.type;
        this.id = tabData.id;
        if (tabData.condition) {
            this.setShowConditions(tabData.condition);
        }

        if (onTabClick) {
            this.onTabClick = onTabClick;
        }
        
        this.createElement();
        
        if (tabData.fields) {
            tabData.fields.forEach(formGroup => {
                this.createField(formGroup, state?.[formGroup.name]);
            });
        }
    }

    createElement() {
        this.content.className = 'tab-content p-1 p-lg-4' + (this.isActive ? ' active' : '');
        this.tabLabel = new TabLabel(this.name, this.label);
        this.tabLabel.onTabClick((tabName) => {
            this.onTabClick(tabName);
        });
    }
    
    createField(fieldData, state) {
        let field = FormRenderer.createField(fieldData, state);
        // const formGroup = new FormGroup(formGroupData);
        this.fields.push(field);
        this.content.appendChild(field.getContent());
    }

    getFormGroups() {
        return this.fields;
    }
    
    setFormGroups(fields) {
        if (!fields || fields.length === 0) {
            return;
        }

        this.fields = fields;

        fields.forEach(group => {
            this.content.appendChild(group.getContent());
        });
    }

    setActive(active) {
        if (active) {
            this.active = true;
            this.content.classList.add('active');
            if (this.object && this.object.onActiveChange) {
                this.object.onActiveChange(true);
            }
        } else {
            this.active = false;
            this.content.classList.remove('active');
        }
        this.tabLabel.setActive(active);
    }

    isActive() {
        return this.active;
    }

    getTabLabel() {
        return this.tabLabel;
    }

    setContent(object) {
        if (!object || !object.getContent) {
            console.error('Invalid object passed to setContent:', object);
            return;
        }
        this.object = object;
        this.content.innerHTML = '';
        this.content.appendChild(object.getContent());
    }

    validate() {
        if (!this.getShow()) {
            return true;
        }
        
        for (const formGroup of this.fields) {
            if (!formGroup.validate()) {
                return false;
            }
        }
        return true;
    }

    getFields() {
        return this.fields;
    }

    setShow(show) {
        super.setShow(show);
        this.tabLabel.setShow(show);
    }
}