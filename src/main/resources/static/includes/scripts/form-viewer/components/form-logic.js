import { Router } from '../../shared/services/router.js';
import { FormButton } from './form-button.js'; 
import { FormRenderer } from './form-renderer.js';
import { Http } from '../../shared/services/http.js';

import { footerService } from "../../shared/services/footer-service.js";

export class FormLogic {
    
    constructor(form) {
        this.form = form;

        // Initialiseer de logica hier
        this.cancelBtn =new FormButton('Annuleren', 'footer-btn btn-secondary cancel', null, () => { });
        this.previousBtn = new FormButton('Vorige', 'footer-btn btn-secondary previous', null, () => {
            this.form.setTabPrevious();
        }, false);
        this.nextBtn = new FormButton('Volgende', 'footer-btn btn-primary next', null, () => {
            this.form.setTabNext();
        }, false);
        this.summaryBtn = new FormButton('Overzicht', 'footer-btn btn-primary next', null, () => {
            this.form.setTab(`summary`);
        }, false);
        this.submitBtn = new FormButton('Verzenden', 'footer-btn btn-primary submit', null, () => {
            Http.post(`${Router.base}/api/forms`, FormRenderer.getFormData(this.form), {})
                        .then(formWrapper => {});
        }, false);

        footerService.addButtonLeft(this.cancelBtn);
        footerService.addButtonLeft(this.previousBtn);

        footerService.addButtonRight(this.nextBtn);
        footerService.addButtonRight(this.summaryBtn);
        footerService.addButtonRight(this.submitBtn);
        
        // Set the tab change handler
        // This will update the URL when the tab changes
        this.form.setOnTabChange((tab, index, size) => {
            Router.route(`/page/form/${Router.lastParams.formName}/tab/${tab.name}`);
            this.setCurrentTabButtons(tab, index, size);
        });

        // If a tab is specified in the URL parameters, set it as the active tab
        // This allows the page to load with the correct tab active based on the URL
        // if ('tab' in Router.lastParams) {
        //     this.form.setTab(Router.lastParams.tab);
        // }
        this.currentTab = Router.lastParams.tabName ? Router.lastParams.tabName : this.form.fields[0].name;
        this.form.setTab(this.currentTab);
    }

    setCurrentTabButtons(tab, index, size) {
        this.previousBtn.hide();
        this.nextBtn.hide();
        this.summaryBtn.hide();
        this.submitBtn.hide();
        this.submitBtn.hide();

        if (index > 0) {
            this.previousBtn.show();
        }
        
        if (index <= size - 3) {
            this.nextBtn.show();
        }
        else if (index == size - 2) {
            this.summaryBtn.show();
        }
        else if (index == size - 1) {
            this.submitBtn.show();
        }

    }
}