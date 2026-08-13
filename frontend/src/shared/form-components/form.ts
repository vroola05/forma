import type { Tab } from './tab';

import { BaseFieldDto, FormDto } from '../model/types';
import { CheckboxField } from './checkbox-field';
import { Nucleus } from './interface/nucleus';
import { Lang } from '../services/lang';
import { FormSummaryRenderer } from '../../form-viewer/components/form-summary-renderer';

export interface FormOptions {
    showSummary: boolean
}

export class Form extends Nucleus {
    
    id: string | undefined = undefined;
    classes: string = '';

    fields: Tab[] = [];
    content: HTMLDivElement = document.createElement('div');
    tabNavInnerContainer: HTMLDivElement | undefined = undefined;
    tabContentContainer: HTMLDivElement | undefined = undefined;
    singlePage: boolean = false;
    confirmation: any[] = [];
    confirmationCheck: any[] | undefined = undefined;
    clientSessionId: string | undefined = undefined;
    
    #options: {
        showSummary: boolean
    } | undefined;
    onTabChange: ((tabObject: Tab, index: number, size: number) => void) | undefined;


    constructor(formDto: FormDto, options: FormOptions | undefined = undefined) {
        super(formDto.name, formDto.label, formDto.id)

        this.#options = options;

        this.id = formDto.id;

        this.type = 'form';

        this.singlePage = !formDto.singlePage ? false : formDto.singlePage;

        this.classes = !formDto?.classes ? '' : formDto?.classes;
        this.confirmation = formDto?.confirmation || [];

        this.createElement();

    }

    static async create(formDto: FormDto, options: FormOptions | undefined = undefined) {
        const instance = new Form(formDto, options);
        await instance.init(formDto);
        return instance;
    }

    async init(formDto: FormDto): Promise<this> {
        if (formDto.fields) {
            await this.createTabs(formDto.fields);
            
            this.createConfirmations(formDto);

            if (this.singlePage) {
                this.setTab();
            }
        }
        
        return this; 
    }

    /**
     * On the summary page it is posible to have confirmation checkboxes.
     * 
     * @param {*} form 
     */
    createConfirmations(form: FormDto) {
        if (!form?.confirmationCheck) {
            return;
        }
        this.confirmationCheck = [];
        for (const f of form?.confirmationCheck) {
            // const confirmation = FormRenderer.createField(f) as CheckboxField;

            // confirmation.setId(confirmation.getName());
            // confirmation.setLayout('layout-column');

            // this.confirmationCheck.push(confirmation);
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
     */
    async createTabs(tabs: BaseFieldDto[]) {
        const { Tab } = await import('../form-components/tab') as any;

        for ( const tabDto of tabs) {
            await this.createTab(tabDto, Tab);
        }

        if (this.#options?.showSummary) {
            this.createTab({
                name:'summary',
                label: Lang.get('form.summary'),
                type: 'tab'}, Tab).then(tab => {

                const summaryRenderer = new FormSummaryRenderer();
                tab.setFormSummary(summaryRenderer);

            });
        }
        
    }


    async createTab(tabDto: BaseFieldDto, Tab: any) {
        const tab = new Tab(tabDto, (tabName: string) => {
            this.setTab(tabName);
        });

        await tab.init(tabDto);

        if (!this.singlePage) {
            const tabLabel = tab.getTabLabel();
            if (tabLabel) {
                this.tabNavInnerContainer?.append(tabLabel.getContent());
            }
        }

        this.tabContentContainer?.append(tab.getContent());

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
    setTab(tabName: string | undefined = undefined) {
        let isValid = true;
        let tabFound = false;
        
        const length = this.fields.length;
        for (let i = 0; i < length; i++) {
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

    setTabActive(tab: Tab, active: boolean, index: number, size: number) {
        if (active) {
            tab.setActive(true);
            if (this.onTabChange) {
                this.onTabChange(tab, index, size);
            }
        } else {
            tab.setActive(false);
        }
    }

    /**
     * 
     * @param {*} onTabChange 
     */
    setOnTabChange(onTabChange: (tabObject: Tab, index: number, size: number) => void) {
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

    validateBE(errorMap: Map<string, any>) {
        const tabs = errorMap.get('fields');
        if (!tabs) {
            return;
        }

        const fields = this.getFields() || [];

        let hasTabSet = false;
        for (const [key2, errors] of tabs) {
            const index = Number(key2);
            if (Number.isNaN(index)) {
                console.error('Backend validation error: key is not a number!')
                return;
            }

            const field = fields[index];
            if (!field) continue;
            
            field.handleValidationError(errors);

            if (!hasTabSet) {
                hasTabSet = true;
                this.setTab(fields[index].getName());
            }
        }

        return false;
    }

    setClientSessionId(clientSessionId: string | undefined) {
        this.clientSessionId = clientSessionId;
    }


    getConfirmationCheck(): any[] | undefined {
        return this.confirmationCheck;
    }

    getVisibleFields() {
        return this.fields.filter(fields => fields.getShow());
    }

    getTabField(tabName: string, name: string) {
        const tabPage = this.fields.find(f => f.name === tabName);
        if (!tabPage) {
            return;
        }
        return tabPage.fields.find(f => f.name === name);
    }

    getField(tabName: string) {
        return this.fields.find(f => f.name === tabName);
    }

    getFields() {
        return this.fields;
    }
}