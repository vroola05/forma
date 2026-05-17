import { Router } from '../../shared/services/router.js';
import { FormButton } from '../../shared/form-components/components/form-button.js'; 
import { FormRenderer } from './form-renderer.js';
import { Http } from '../../shared/services/http.js';
import { FormSubmission } from '../../shared/model/form-data.js';
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
            if (!this.form.validate()) {
                return;
            }

            Http.post(`${Router.tenantPath}/api/forms`, FormRenderer.getFormData(this.form), {})
                        .then(formSubmissionData => {
                            const formNameUrlParam = Router.getUrlParameter('formName');
                            Router.route(`/page/form/${formNameUrlParam}/success`, {
                                formSubmission: new FormSubmission(formSubmissionData)
                            });
                        });
        }, false);

        footerService.addButtonLeft(this.cancelBtn);
        footerService.addButtonLeft(this.previousBtn);

        footerService.addButtonRight(this.nextBtn);
        footerService.addButtonRight(this.summaryBtn);
        footerService.addButtonRight(this.submitBtn);
        
        // Set the tab change handler
        // This will update the URL when the tab changes
        this.form.setOnTabChange((tab, index, size) => {
            const formNameUrlParam = Router.getUrlParameter('formName');
            Router.route(`/page/form/${formNameUrlParam}/tab/${tab.name}`);
            this.setCurrentTabButtons(tab, index, size);
        });

        // If a tab is specified in the URL parameters, set it as the active tab
        // This allows the page to load with the correct tab active based on the URL
        const tabNameUrlParam = Router.getUrlParameter('tabName');
        this.currentTab = tabNameUrlParam ? tabNameUrlParam : this.form.fields[0].name;
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