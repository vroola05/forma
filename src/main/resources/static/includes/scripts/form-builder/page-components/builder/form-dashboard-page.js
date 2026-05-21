import { Page } from '../../../shared/page-components/page.js';
import { Http } from '../../../shared/services/http.js';
import { Router } from '../../../shared/services/router.js';
import { Lang } from '../../../shared/services/lang.js';
import { SettingsPage } from '../settings-page.js';
import { Column, List, ListDefinition } from '../../../shared/generic-components/list.js';
import { FormButton } from '../../../shared/form-components/components/form-button.js';

export class FormDashboard extends SettingsPage {
    searchtimeout = null;
    formsList = [];
    search = '';
    
    constructor() {
        super(Lang.get('form.dashboard.title'));

        this.createContent();
        this.addTitleButton(new FormButton('','icon icon-plus-lg',`/admin/page/form-builder/new`));
    }


    createContent() {
        
        const seachBar = document.createElement('div');
        seachBar.className = 'search-bar row mt-4';
        this.append(seachBar);

        const seachBarInner = document.createElement('div');
        seachBarInner.className = 'search-bar-inner col-md-6 offset-md-3';
        seachBar.append(seachBarInner);

        this.searchInput = document.createElement('input');
        this.searchInput.className = 'form-control form-control-lg';
        this.searchInput.type = 'text';
        this.searchInput.id = 'form-dashboard-search';
        
        this.searchInput.placeholder = Lang.get('generic.search');
        this.searchInput.ariaLabel = Lang.get('generic.search');
        seachBarInner.append(this.searchInput);

        const formDashboardItemsWrapper = document.createElement('div');
        formDashboardItemsWrapper.className = 'form-dashboard-items-wrapper mt-2 m-1 m-lg-5';
        this.append(formDashboardItemsWrapper);

        this.formDashboardItems = document.createElement('div');
        this.formDashboardItems.id = 'form-dashboard-items';
        this.formDashboardItems.className = 'container-fluid form-dashboard-items';
        formDashboardItemsWrapper.append(this.formDashboardItems);

        this.formList = new List(new ListDefinition([
            new Column('Name', 'text', 'label'),
            new Column('Slug', 'boolean', 'name'),
            new Column('Active', 'boolean', 'active')
        ]));

        this.formList.setOnClick((index, form) => {
            Router.route(`/admin/page/form-builder/${form.name}`);
        });

        this.append(this.formList.getContent());
    }

    afterInit() {
        Http.get(`${Router.tenantPath}/api/form-builder/form`, {}).then((forms) => {
            this.formList.setData(forms);
            // this.parseOverviewItems();
            // this.addSearchListener();
        });
    }


    parseDate(dateStr) {
        if (!dateStr || dateStr==='')
            return '';
        const d = new Date(dateStr);
        return d.getDate() + '-' + (d.getMonth()+1) + '-' + d.getFullYear();
    }

  

    addSearchListener() {
        this.searchInput.addEventListener("input", (event) => {
            this.search = event.target.value.toLowerCase();
            clearTimeout(this.searchtimeout);
            this.searchtimeout = setTimeout(() => { 
                this.parseOverviewItems();
             }, 500);
        });
    }

}