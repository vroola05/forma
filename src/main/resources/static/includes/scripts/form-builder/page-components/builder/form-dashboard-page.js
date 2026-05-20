import { Page } from '../../../shared/page-components/page.js';
import { Http } from '../../../shared/services/http.js';
import { Router } from '../../../shared/services/router.js';
import { Lang } from '../../../shared/services/lang.js';
import { AdminHeader } from '../../component/admin-header.js';

export class FormDashboard extends Page {
    searchtimeout = null;
    formsList = [];
    search = '';
    loader = document.querySelector('.loader');

    queryParams = {
        search: '',
        listSize: '10',
        listOffset: '0'
    };

    constructor() {
        super();
        this.setTitle(Lang.get('form.dashboard.title'));
        this.header = new AdminHeader();
        this.createContent();
    }


    createContent() {
        this.content = document.createElement('div');
        this.content.className = 'container-fluid mt-4 form-dashboard-wrapper';

        const header = document.createElement('h1');
        header.className = 'text-center';
        header.innerHTML = Lang.get('form.dashboard.title');
        this.content.append(header);

        const seachBar = document.createElement('div');
        seachBar.className = 'search-bar row mt-4';
        this.content.append(seachBar);

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
        this.content.append(formDashboardItemsWrapper);

        this.formDashboardItems = document.createElement('div');
        this.formDashboardItems.id = 'form-dashboard-items';
        this.formDashboardItems.className = 'container-fluid form-dashboard-items';
        formDashboardItemsWrapper.append(this.formDashboardItems);
    }

    afterInit() {
        
        this.addSearchListener();
        this.getOverviewItems();

    }

    getOverviewItems() {
        
            this.loader.classList.add('active');
            Http.get(`${Router.tenantPath}/api/forms`, {})
                .then(formsList => {
                    this.loader.classList.remove('active');
                    this.formsList = formsList;
                    this.parseOverviewItems();
                })
                .catch(() => {
                    this.loader.classList.remove('active');
                    document.getElementById('header').innerText = Lang.get('generic.not.logged.in');
                });
        
    }

    parseOverviewItems() {
        const formsList = this.formsList.filter(project => this.search === ''
            || this.notNullLower(project.plannummer).includes(this.search)
            || this.notNullLower(project.hoofdprojectPlannummer).includes(this.search)

        );
        
        this.formDashboardItems.innerHTML = 
        `<div class="form-dashboard-header shadow-sm fw-bolder row p-1 p-lg-2 border-bottom">
                <div class="col-12 col-md-5">${Lang.get('form.dashboard.list.name')}</div>
                <div class="col-12 col-md-5">${Lang.get('form.dashboard.list.title')}</div>
                <div class="col-12 col-md-2">${Lang.get('form.dashboard.list.active')}</div>
                
            </div>` +
        formsList.map(formList => `
            <div class="form-dashboard-item row p-1 p-lg-2 border-bottom" data-form-name="${this.notNull(formList.name)}">
                <div class="col-12 col-md-5 d-flex flex-row flex-lg-column"><div class="flex-grow-1">${this.notNull(formList.name)}</div></div>
                <div class="col-12 col-md-5 d-flex flex-row flex-lg-column"><div class="flex-grow-1">${this.notNull(formList.title)}</div></div>
                <div class="col-12 col-md-2 d-flex flex-row flex-lg-column"><div class="flex-grow-1">${this.notNull(formList.active)}</div></div>
            </div>`).join('');

        document.querySelectorAll('.form-dashboard-item').forEach(item => {
            item.addEventListener('click', function () {
                const formName = this.dataset.formName;
                
                Router.route(`/admin/page/form-builder/${formName}`);
                
            });
        });
    }


    parseDate(dateStr) {
        if (!dateStr || dateStr==='')
            return '';
        const d = new Date(dateStr);
        return d.getDate() + '-' + (d.getMonth()+1) + '-' + d.getFullYear();
    }

    notNullLower(input) {
        return  !input ? '' : typeof input !== 'string' ? input.toString() : input.toLowerCase();
    }

    notNull(input) {
        return !input ? '' : input;
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

    
    getContent() {
        const fragment = document.createDocumentFragment();
        fragment.append(this.header.getContent(), this.content);

        return fragment;
    }
}