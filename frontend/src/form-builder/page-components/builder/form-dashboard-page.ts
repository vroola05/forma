import { Http } from '../../../shared/services/http';
import { Router } from '../../../shared/services/router';
import { Lang } from '../../../shared/services/lang';
import { SettingsPage } from '../settings-page';
import { Column, List, ListDefinition } from '../../../shared/generic-components/list';
import { FormButton } from '../../../shared/form-components/components/form-button';
import { FORM_STATUS } from '../../../shared/model/types';

export class FormDashboard extends SettingsPage {
    searchInput = document.createElement('input');
    formDashboardItems = document.createElement('div');

    formList: List;
    searchTimeout: NodeJS.Timeout | undefined = undefined;
    formsList = [];
    search = '';
    
    constructor() {
        super(Lang.get('form.dashboard.title'));

        const seachBar = document.createElement('div');
        seachBar.className = 'search-bar row mt-4';
        this.append(seachBar);

        const seachBarInner = document.createElement('div');
        seachBarInner.className = 'search-bar-inner col-md-6 offset-md-3';
        seachBar.append(seachBarInner);

        this.searchInput.className = 'form-control form-control-lg';
        this.searchInput.type = 'text';
        this.searchInput.id = 'form-dashboard-search';
        
        this.searchInput.placeholder = Lang.get('generic.search');
        this.searchInput.ariaLabel = Lang.get('generic.search');
        seachBarInner.append(this.searchInput);

        const formDashboardItemsWrapper = document.createElement('div');
        formDashboardItemsWrapper.className = 'form-dashboard-items-wrapper mt-2 m-1 m-lg-5';
        this.append(formDashboardItemsWrapper);

        this.formDashboardItems.id = 'form-dashboard-items';
        this.formDashboardItems.className = 'container-fluid form-dashboard-items';
        formDashboardItemsWrapper.append(this.formDashboardItems);

        this.formList = new List(new ListDefinition([
            new Column(Lang.get('generic.name'), 'text', 'label'),
            new Column(Lang.get('generic.slug'), 'boolean', 'name'),
            new Column(Lang.get('generic.status'), 'text', 'status')
        ]));

        this.formList.setOnClick((index, form) => {
            Router.route(`/admin/page/forms/${form.name}`);
        });

        this.append(this.formList.getContent());

        this.addTitleButton(new FormButton('','icon icon-plus-lg',`/admin/page/forms/new`));
    }

    afterInit() {
        Http.get(`${Router.tenantPath}/api/form-builder/form`, {}).then((forms: any) => {
            this.formList.setData(forms.map((form: any) => ({
                label: form.label,
                name: form.name,
                status: !form.status ? '' : FORM_STATUS[form.status as keyof typeof FORM_STATUS]()})));
            
            // this.addSearchListener();
        });
    }


    parseDate(dateStr: string | undefined) {
        if (!dateStr || dateStr==='') {
            return '';
        }

        const date = new Date(dateStr);
        return date.getDate() + '-' + (date.getMonth()+1) + '-' + date.getFullYear();
    }

  

    addSearchListener() {
        this.searchInput.addEventListener('input', (event: Event) => {
            if (!event.target) {
                return;
            }
            const target = event.target as HTMLInputElement;
            this.search = target.value.toLowerCase();
            clearTimeout(this.searchTimeout);
            this.searchTimeout = setTimeout(() => { 
                
             }, 500);
        });
    }

}