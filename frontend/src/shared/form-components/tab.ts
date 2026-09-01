import { Nucleus } from './interface/nucleus';

import { TabLabel } from './components/tab-label';

import { FormRenderer } from '../generic-components/form-renderer';

import { FormSummaryRenderer } from '../../form-viewer/components/form-summary-renderer';
import { BaseFieldDto, FieldDto } from '../model/types';

export class Tab extends Nucleus {
    content: HTMLDivElement = document.createElement('div');
    formSummary: FormSummaryRenderer | null = null;
    fields: Nucleus[] = [];
    active: boolean = false;
    tabLabel: TabLabel | undefined;

    onTabClick: ((tabName: string) => void) | undefined;

    constructor(baseFieldDto: BaseFieldDto, onTabClick: (tabName: string) => void) {
        super(baseFieldDto.name, baseFieldDto.labels, baseFieldDto.id);

        this.label = baseFieldDto.label;
        this.type = baseFieldDto.type;
        
        if (baseFieldDto.condition) {
            this.setShowConditions(baseFieldDto.condition);
        }

        if (onTabClick) {
            this.onTabClick = onTabClick;
        }
        
        this.createElement();
        
    }

    async init(baseFieldDto: BaseFieldDto): Promise<this> {
        if (baseFieldDto.fields) {
            await this.createFields(baseFieldDto.fields)
                .then((field) => {})
                .catch(error => console.error("Something went wrong:", error));
        }

        return this;
    }
    

    async createFields(fields: FieldDto[])  {
        for (const fieldDto of fields) {
            
            const field = await FormRenderer.createField(fieldDto);
            if (!field || (!(field instanceof Nucleus))) {
                throw new Error('Input must be an instance of Nucleus');
            }

            this.fields.push(field);

            this.content.append(field.getContent())
            
            field.afterInit();
        }
        
    }
    
    createElement() {
        this.content.className = 'tab-content p-1 p-lg-4' + (this.active ? ' active' : '');
        this.tabLabel = new TabLabel(this.name, this.getLabel());
        this.tabLabel.onTabClick((tabName) => {
            if (this.onTabClick && tabName) {
                this.onTabClick(tabName);
            }
        });
    }

    setActive(active: boolean) {
        if (active) {
            this.active = true;
            this.content.classList.add('active');
            if (this.formSummary?.onActiveChange) {
                this.formSummary.onActiveChange(true);
            }
        } else {
            this.active = false;
            this.content.classList.remove('active');
        }
        this.tabLabel?.setActive(active);
    }

    isActive() {
        return this.active;
    }

    getTabLabel(): TabLabel | undefined {
        return this.tabLabel;
    }

    setFormSummary(formSummary: FormSummaryRenderer) {
        if (!formSummary || !formSummary.getContent) {
            console.error('Invalid formSummary passed to setContent:', formSummary);
            return;
        }
        this.formSummary = formSummary;
        this.content.innerHTML = '';
        this.content.appendChild(formSummary.getContent());
    }

    validate() {
        if (!this.getShow()) {
            return true;
        }
        
        let isValid = true;
        for (const field of this.fields) {
            if (field instanceof Nucleus && !field.validate()) {
                isValid = false;
            }
        }
        return isValid;
    }

    hasChildren(): boolean {
        return true;
    }

    getFields(): Nucleus[] {
        return this.fields;
    }

    setShow(show: boolean) {
        super.setShow(show);
        this.tabLabel?.setShow(show);
    }
}