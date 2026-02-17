import { Page } from '../../shared/page-components/page.js';
import { Http } from '../../shared/services/http.js';
import { Router } from '../../shared/services/router.js';
import { Lang } from '../../shared/services/lang.js';

export class OverviewPage extends Page {
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
        this.setTitle(Lang.get('overview.title'));
        this.createContent();
    }


    createContent() {
        this.content = document.createElement('div');
        this.content.className = 'container-fluid mt-4 overview-wrapper';

        const header = document.createElement('h1');
        header.className = 'text-center';
        header.innerHTML = Lang.get('overview.title');
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
        this.searchInput.id = 'overview-search';
        
        this.searchInput.placeholder = Lang.get('generic.search');
        this.searchInput.ariaLabel = Lang.get('generic.search');
        seachBarInner.append(this.searchInput);


        const overviewItemsWrapper = document.createElement('div');
        overviewItemsWrapper.className = 'overview-items-wrapper mt-2 m-1 m-lg-5';
        this.content.append(overviewItemsWrapper);

        this.overviewItems = document.createElement('div');
        this.overviewItems.id = 'overview-items';
        this.overviewItems.className = 'container-fluid overview-items';
        overviewItemsWrapper.append(this.overviewItems);
    }

    afterInit() {
        
        this.addSearchListener();
        this.getOverviewItems();

    }

    getOverviewItems() {
        
            this.loader.classList.add('active');
            Http.get(`${Router.base}/api/forms`, {})
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
        
        this.overviewItems.innerHTML = 
        `<div class="overview-header shadow-sm fw-bolder row p-1 p-lg-2 border-bottom">
                <div class="col-12 col-md-5">${Lang.get('overview.list.name')}</div>
                <div class="col-12 col-md-5">${Lang.get('overview.list.title')}</div>
                <div class="col-12 col-md-2">${Lang.get('overview.list.active')}</div>
                
            </div>` +
        formsList.map(formList => `
            <div class="overview-item row p-1 p-lg-2 border-bottom" data-form-name="${this.notNull(formList.name)}">
                <div class="col-12 col-md-5 d-flex flex-row flex-lg-column"><div class="flex-grow-1">${this.notNull(formList.name)}</div></div>
                <div class="col-12 col-md-5 d-flex flex-row flex-lg-column"><div class="flex-grow-1">${this.notNull(formList.title)}</div></div>
                <div class="col-12 col-md-2 d-flex flex-row flex-lg-column"><div class="flex-grow-1">${this.notNull(formList.active)}</div></div>
            </div>`).join('');

        document.querySelectorAll('.overview-item').forEach(item => {
            item.addEventListener('click', function () {
                const formName = this.dataset.formName;
                
                Router.route(`/page/form-builder/${formName}`);
                
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
}