
import { Auth } from '../../auth.js';
import { Page } from '../../shared/page-components/page.js';
import { Http } from '../../shared/services/http.js';
import { Router } from '../../shared/services/router.js';
import { FormGroup } from '../../shared/form-components/form-group.js';
import { CheckboxField } from '../../shared/form-components/checkbox-field.js';
import { SelectField } from '../../shared/form-components/select-field.js';
import { FormRenderer } from '../../form-viewer/components/form-renderer.js'

export class RevisionPage extends Page {
    content = document.createElement('div');
    pageContentContainer = document.createElement('div');
    pageRevisionSelectorContainer = document.createElement('div');
    pageRevisionContainer = document.createElement('div');
    
    loader = document.querySelector('.loader');
    projectName = '';
    revLabel = '';

    groups = [];
    filters = [];
    revision = [];

    constructor() {
        super();
        if (Router.lastParams && 'id' in Router.lastParams && Router.lastParams.id) {
            if (this.parameters && 'id' in this.parameters && this.parameters.id != Router.lastParams.id) {
                console.log('Clear because other id.');
                FormGroup.clearPage(this.constructor.name);
            }
        } else {
            Router.route('/')
        }
        this.setPageParameters({ id: Router.lastParams.id });

        this.createContent();

        this.setTitle('Details');

    }

    createContent() {
        this.content.className = 'container-fluid mt-4 p-0 page-wrapper';

        this.pageTitle = document.createElement('h1');
        this.pageTitle.className = 'page-title text-center';
        this.pageTitle.innerHTML = 'Detail';
        this.content.append(this.pageTitle);

        this.pageContentContainer.id = 'page-content-container';
        this.pageContentContainer.className = 'page-content-container position-relative mt-5 ms-2 me-0 ms-lg-5 me-lg-5 mb-3';
        this.content.append(this.pageContentContainer);

        this.pageRevisionSelectorContainer.className = 'page-revsion-selector-container w-100 w-lg-50';
        this.pageContentContainer.appendChild(this.pageRevisionSelectorContainer);


        this.buttonCompare = document.createElement('div');
        this.buttonCompare.className = 'compare-revisions-button builder-btn-icon';
        this.buttonCompare.innerHTML = '';
        this.buttonCompare.onclick = () => {
            this.getForm(`${Router.base}/api/group/${Auth.getGroup()}/project/${Router.lastParams.id}/revision/${this.revisionId}`, this.revisionFormContent);
            this.formContent.classList.add('active');
        };
        this.pageContentContainer.append(this.buttonCompare);


        this.pageRevisionContainer.className = 'page-revsion-container';
        this.pageContentContainer.appendChild(this.pageRevisionContainer);

        this.selectField = new SelectField('date-list', 'Revisie');
        this.selectField.setPlaceholder('Selecteer een revisie');
        this.selectField.onValueChanged(
            (name, value) => {
                this.revLabel = value.text;
                this.getRevision(value);
                this.buttonCompare.classList.add('active');
            });
        this.pageRevisionSelectorContainer.appendChild(this.selectField.getContent());

        this.filter = new CheckboxField('filter', 'Filter', 'horizontal');
        
        this.filter.addOptions([
            {'text': 'Toegevoegd', 'value': 'ADDED', 'selected': true},
            {'text': 'Verwijderd', 'value': 'DELETED', 'selected': true},
            {'text': 'Aangepast', 'value': 'CHANGED', 'selected': true},
            {'text': 'Niet aangepast', 'value': 'NOT_CHANGED'}
        ]);
        this.filters = this.filter.getOptions();

        this.filter.onValueChanged(
            (name, value) => {
                this.filters = this.filter.getOptions();
                this.createRevisionData();
            });
        this.pageRevisionSelectorContainer.appendChild(this.filter.getContent());

        

        
        this.formContent = document.createElement('div');
        this.formContent.className = 'form-comparison-container';
        this.content.append(this.formContent);

        const formContentHeader = document.createElement('div');
        formContentHeader.className = 'form-comparison-container-header';
        this.formContent.append(formContentHeader);

        const closeDom = document.createElement('div');
        closeDom.className = '';
        closeDom.innerHTML = 'X';
        formContentHeader.append(closeDom);
        closeDom.onclick = () => {
            this.formContent.classList.remove('active');
        };

        const formContentInner = document.createElement('div');
        formContentInner.className = 'form-comparison-container-inner';
        this.formContent.append(formContentInner);

        this.currentFormContent = document.createElement('div');
        this.currentFormContent.className = 'current-form-container';
        formContentInner.append(this.currentFormContent);

        this.revisionFormContent = document.createElement('div');
        this.revisionFormContent.className = 'revision-form-container';
        formContentInner.append(this.revisionFormContent);

        this.getRevisionList();
        this.getForm(`${Router.base}/api/group/${Auth.getGroup()}/project/${Router.lastParams.id}`, this.currentFormContent);
    }

    afterInit() {
        
    }

    setTitle(title) {
        this.title = title;
        this.pageTitle.innerHTML = title;
        
        document.title = title;
    }

    getRevisionList() {
        this.loader.classList.add('active');
        Http.get(`${Router.base}/api/group/${Auth.getGroup()}/project/${Router.lastParams.id}/revision/list`)
            .then(backupWijzigingenDatum => {
                this.loader.classList.remove('active');
                if (!backupWijzigingenDatum) {
                    console.error('No fields found in the project details');
                    return;
                }
                backupWijzigingenDatum.forEach( wijziging => {
                    this.selectField.addOption(wijziging.id, this.parseDate(wijziging.datum));
                });
               
            })
            .catch(error => {
                this.loader.classList.remove('active');
                console.error('Error fetching project details:', error);
            });
    }

    getRevision(option) {
        this.revisionId = option.value;
        this.loader.classList.add('active');
        Http.get(`${Router.base}/api/group/${Auth.getGroup()}/project/${Router.lastParams.id}/revision/${option.value}/comparison`)
            .then(revision => {
                this.revision = revision;
                this.loader.classList.remove('active');
                if (!revision) {
                    console.error('No fields found in the project details');
                    return;
                }
                
               this.createRevisionData();
            })
            .catch(error => {
                this.loader.classList.remove('active');
                console.error('Error fetching project details:', error);
            });
    }

    createRevisionData() {
        this.pageRevisionContainer.innerHTML = '';
        if (!this.revision)
            return;


        const row = document.createElement('div');
        row.className = 'row header';
        
        const colType = document.createElement('div');
        colType.className = 'col';
        colType.innerHTML = 'Type';
        row.appendChild(colType);

        const colLabel = document.createElement('div');
        colLabel.className = 'col';
        colLabel.innerHTML = "Label";
        row.appendChild(colLabel);

        const colValueCurrent = document.createElement('div');
        colValueCurrent.className = 'col';
        colValueCurrent.innerHTML = 'Huidige waarde';
        row.appendChild(colValueCurrent);

        const colValueRevision = document.createElement('div');
        colValueRevision.className = 'col';
        colValueRevision.innerHTML = 'Waarde revisie ' + this.revLabel;
        row.appendChild(colValueRevision);

        this.pageRevisionContainer.appendChild(row);

        const filteredList = this.revision.filter(rev => this.filters.length === 0 || this.filters.some(o => o.value === rev.change));
        filteredList.forEach( rev => {
            const row = document.createElement('div');
            row.className = 'row ' + rev.change.toLowerCase();

            const colType = document.createElement('div');
            colType.className = 'col rev-type';
            colType.innerHTML = this.getRevType(rev.change);
            row.appendChild(colType);

            const colLabel = document.createElement('div');
            colLabel.className = 'col rev-label';
            colLabel.innerHTML = rev.label;
            row.appendChild(colLabel);

            const colValueCurrent = document.createElement('div');
            colValueCurrent.className = 'col rev-val-cur';
            colValueCurrent.innerHTML = rev.valueCurrent;
            row.appendChild(colValueCurrent);

            const colValueRevision = document.createElement('div');
            colValueRevision.className = 'col rev-val-cur';
            colValueRevision.innerHTML = rev.valueRevision;
            row.appendChild(colValueRevision);

            this.pageRevisionContainer.appendChild(row);

            // ComparatorForm 
            // private ComparatorType change;

            // private String name;
            // private String label;
            // private String valueCurrent;
            // private String valueRevision; 
        });
    }

    getRevType(type) {
        switch(type) {
            case 'ADDED':
                return 'Toegevoegd';
            case 'DELETED':
                return 'Verwijderd';
            case 'CHANGED':
                return 'Aangepast';
            case 'NOT_CHANGED':
                return 'Niet aangepast';
        }
    }

    parseDate(input) {
         const date = new Date(input);
        const pad = n => n.toString().padStart(2, '0');
        return `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()} om ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;

    }


    getForm(url, domContainer) {
        this.loader.classList.add('active');
        domContainer.innerHTML = '';
        Http.get(url)
            .then(formData => {
                
                this.loader.classList.remove('active');
                if (!formData) {
                    console.error('No fields found in the project details');
                    return;
                }
                
                this.form = FormRenderer.createForm(formData.form);
                domContainer.appendChild(this.form.getContent());
               
            })
            .catch(error => {
                this.loader.classList.remove('active');
                console.error('Error fetching project details:', error);
            });
    }

}

